import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "@/server/corsair";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const tenant = corsair.withTenant(user.id);

    const tools = [
      tool({
        name: "getLatestEmails",
        description: "Retrieve the user's latest emails from their inbox, including subject, sender, snippet, and date.",
        parameters: z.object({
          limit: z.number().optional().default(5).describe("Maximum number of emails to retrieve (default is 5)."),
        }),
        execute: async ({ limit }) => {
          try {
            const data = await tenant.gmail.db.messages.search({ limit });
            if (!data || data.length === 0) return { success: true, emails: [] };
            const emails = data.map((item: any) => {
              const msg = item.data || {};
              return {
                id: item.entity_id || item.id || msg.id,
                subject: msg.subject || "No Subject",
                sender: msg.from || "Unknown",
                snippet: msg.snippet || "",
                date: msg.createdAt || item.created_at || new Date().toISOString(),
              };
            });
            return { success: true, emails };
          } catch (error: any) {
            console.error("Error in getLatestEmails tool:", error);
            return {
              success: false,
              userMessage: "Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages."
            };
          }
        }
      }),
      tool({
        name: "getUpcomingEvents",
        description: "Retrieve the user's upcoming calendar events, including summary, start date/time, end date/time, and attendees.",
        parameters: z.object({
          limit: z.number().optional().default(5).describe("Maximum number of events to retrieve (default is 5)."),
        }),
        execute: async ({ limit }) => {
          try {
            const data = await tenant.googlecalendar.db.events.search({ limit });
            if (!data || data.length === 0) return { success: true, events: [] };
            
            const events = data.map((item: any) => {
              const event = item.data || {};
              let startStr = "";
              let endStr = "";
              
              const parseJsonOrObj = (val: any) => {
                if (!val) return null;
                if (typeof val === "string") {
                  try { return JSON.parse(val); } catch(e) { return null; }
                }
                return val;
              };

              const startObj = parseJsonOrObj(event.start);
              const endObj = parseJsonOrObj(event.end);
              
              startStr = startObj?.dateTime || startObj?.date || event.created || event.updated || item.created_at || "";
              endStr = endObj?.dateTime || endObj?.date || event.created || event.updated || item.created_at || "";

              return {
                id: item.entity_id || item.id || event.id,
                summary: event.summary || "Untitled Event",
                start: startStr,
                end: endStr,
                attendees: Array.isArray(parseJsonOrObj(event.attendees)) 
                  ? parseJsonOrObj(event.attendees).map((a: any) => a.email).filter(Boolean)
                  : [],
              };
            });
            return { success: true, events };
          } catch (error: any) {
            console.error("Error in getUpcomingEvents tool:", error);
            return {
              success: false,
              userMessage: "Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events."
            };
          }
        }
      }),
      tool({
        name: "sendEmail",
        description: "Send an email to a specified recipient with a subject and body.",
        parameters: z.object({
          to: z.string().describe("The recipient email address."),
          subject: z.string().describe("The email subject line."),
          body: z.string().describe("The email body message."),
        }),
        execute: async ({ to, subject, body }) => {
          try {
            const rawMessage = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
            const encodedMessage = Buffer.from(rawMessage).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            await tenant.gmail.api.messages.send({
              userId: "me",
              raw: encodedMessage,
            });
            return { success: true };
          } catch (error: any) {
            console.error("Error in sendEmail tool:", error);
            return {
              success: false,
              userMessage: "Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages."
            };
          }
        }
      }),
      tool({
        name: "createCalendarEvent",
        description: "Create a calendar event with a summary, start date/time, and end date/time.",
        parameters: z.object({
          summary: z.string().describe("Brief title/summary of the meeting/event."),
          startDateTime: z.string().describe("The start date and time as an ISO 8601 string (e.g., '2026-06-18T10:00:00Z')."),
          endDateTime: z.string().describe("The end date and time as an ISO 8601 string (e.g., '2026-06-18T11:00:00Z')."),
        }),
        execute: async ({ summary, startDateTime, endDateTime }) => {
          try {
            await tenant.googlecalendar.api.events.create({
              calendarId: "primary",
              event: {
                summary,
                start: {
                  dateTime: startDateTime,
                  timeZone: "UTC",
                },
                end: {
                  dateTime: endDateTime,
                  timeZone: "UTC",
                },
              },
            });
            return { success: true };
          } catch (error: any) {
            console.error("Error in createCalendarEvent tool:", error);
            return {
              success: false,
              userMessage: "Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events."
            };
          }
        }
      }),
    ];

    const agent = new Agent({
      name: "ZeroClick",
      model: "openrouter/free",
      instructions: `You are ZeroClick.

You are an AI executive assistant.

Users should feel like they are talking to a productivity assistant, not a developer tool.

IMPORTANT:
Never expose implementation details, OAuth tokens, API keys, Corsair internals, MCP operations, database operations, tool names, operation IDs, SDK methods, code snippets, or setup instructions to the user.

Users should never be asked to manually configure access tokens, refresh tokens, OAuth credentials, or Google Cloud settings.

If a tool returns success=false, show only the userMessage. Never expose raw tool output.

If Gmail is not connected:
"Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages."

If Calendar is not connected:
"Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events."

Never discuss APIs, SDKs, MCP servers, OAuth tokens, operation IDs, databases, or implementation details.

Focus only on helping users manage emails, meetings, and schedules.

For "summarize my emails" type requests: fetch emails, then write a concise summary.
For "show my meetings" type requests: fetch events, then format them clearly.
For "schedule a meeting" type requests: parse the details and create the event.
For "send an email" type requests: parse the details and send it.

Keep responses short, polite, user-friendly, and action-oriented. Format responses nicely with line breaks and bullet points where helpful.
Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
      tools,
    });

    // Run the agent
    const result = await run(agent, prompt);

    return NextResponse.json({ response: result.finalOutput });
  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}
