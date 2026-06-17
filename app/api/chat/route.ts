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

    const { messages, prompt } = await req.json();
    const inputMessages = messages || [{ role: "user", content: prompt }];

    if (!inputMessages || inputMessages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    const tenant = corsair.withTenant(user.id);

    const tools = [
      tool({
        name: "getLatestEmails",
        description:
          "Retrieve the user's latest emails from their inbox, including subject, sender, snippet, and date.",
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .default(5)
            .describe("Maximum number of emails to retrieve (default is 5)."),
        }),
        execute: async ({ limit }) => {
          try {
            const data = await tenant.gmail.db.messages.search({ limit });
            if (!data || data.length === 0)
              return { success: true, emails: [] };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const emails = data.map((item: any) => {
              const msg = item.data || {};
              return {
                id: item.entity_id || item.id || msg.id,
                subject: msg.subject || "No Subject",
                sender: msg.from || "Unknown",
                snippet: msg.snippet || "",
                date:
                  msg.createdAt || item.created_at || new Date().toISOString(),
              };
            });
            return { success: true, emails };
          } catch (error: unknown) {
            console.error("Error in getLatestEmails tool:", error);
            return {
              success: false,
              userMessage:
                "Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages.",
            };
          }
        },
      }),
      tool({
        name: "getUpcomingEvents",
        description:
          "Retrieve the user's upcoming calendar events, including summary, start date/time, end date/time, and attendees.",
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .default(5)
            .describe("Maximum number of events to retrieve (default is 5)."),
        }),
        execute: async ({ limit }) => {
          try {
            const data = await tenant.googlecalendar.db.events.search({
              limit,
            });
            if (!data || data.length === 0)
              return { success: true, events: [] };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const events = data.map((item: any) => {
              const event = item.data || {};
              let startStr = "";
              let endStr = "";

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const parseJsonOrObj = (val: any) => {
                if (!val) return null;
                if (typeof val === "string") {
                  try {
                    return JSON.parse(val);
                  } catch {
                    return null;
                  }
                }
                return val;
              };

              const startObj = parseJsonOrObj(event.start);
              const endObj = parseJsonOrObj(event.end);

              startStr =
                startObj?.dateTime ||
                startObj?.date ||
                event.created ||
                event.updated ||
                item.created_at ||
                "";
              endStr =
                endObj?.dateTime ||
                endObj?.date ||
                event.created ||
                event.updated ||
                item.created_at ||
                "";

              return {
                id: item.entity_id || item.id || event.id,
                summary: event.summary || "Untitled Event",
                start: startStr,
                end: endStr,
                attendees: Array.isArray(parseJsonOrObj(event.attendees))
                  ? parseJsonOrObj(event.attendees)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .map((a: any) => a.email)
                      .filter(Boolean)
                  : [],
              };
            });
            return { success: true, events };
          } catch (error: unknown) {
            console.error("Error in getUpcomingEvents tool:", error);
            return {
              success: false,
              userMessage:
                "Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events.",
            };
          }
        },
      }),
      tool({
        name: "sendEmail",
        description:
          "Send an email to a specified recipient with a subject and body.",
        parameters: z.object({
          to: z.string().optional().describe("The recipient email address."),
          subject: z.string().optional().describe("The email subject line."),
          body: z.string().optional().describe("The email body message."),
        }),
        execute: async ({ to, subject, body }) => {
          const missingFields = [];
          if (!to) missingFields.push("to (recipient)");
          if (!subject) missingFields.push("subject");
          if (!body) missingFields.push("body");

          if (missingFields.length > 0) {
            return {
              success: false,
              missingFields,
            };
          }

          try {
            const rawMessage = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
            const encodedMessage = Buffer.from(rawMessage)
              .toString("base64")
              .replace(/\+/g, "-")
              .replace(/\//g, "_")
              .replace(/=+$/, "");
            await tenant.gmail.api.messages.send({
              userId: "me",
              raw: encodedMessage,
            });
            return { success: true };
          } catch (error: unknown) {
            console.error("Error in sendEmail tool:", error);
            return {
              success: false,
              userMessage:
                "Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages.",
            };
          }
        },
      }),
      tool({
        name: "createCalendarEvent",
        description:
          "Create a calendar event with a summary, start date/time, and end date/time.",
        parameters: z.object({
          summary: z
            .string()
            .optional()
            .describe("Brief title/summary of the meeting/event."),
          startDateTime: z
            .string()
            .optional()
            .describe(
              "The start date and time as an ISO 8601 string (e.g., '2026-06-18T10:00:00Z').",
            ),
          endDateTime: z
            .string()
            .optional()
            .describe(
              "The end date and time as an ISO 8601 string (e.g., '2026-06-18T11:00:00Z').",
            ),
        }),
        execute: async ({ summary, startDateTime, endDateTime }) => {
          const missingFields = [];
          if (!summary) missingFields.push("title");
          if (!startDateTime) missingFields.push("start time");
          if (!endDateTime) missingFields.push("end time");

          if (missingFields.length > 0) {
            return {
              success: false,
              missingFields,
            };
          }

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
          } catch (error: unknown) {
            console.error("Error in createCalendarEvent tool:", error);
            return {
              success: false,
              userMessage:
                "Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events.",
            };
          }
        },
      }),
    ];

    const agent = new Agent({
      name: "ZeroClick",
      model: "openrouter/free",
      instructions: `You are ZeroClick, an AI executive assistant.

You help users manage Gmail and Google Calendar.

You have memory of the current conversation and must use previous messages when interpreting new requests.

When information is missing:
* Ask only for missing information.
* Never ask again for information already provided.
* Prefer collecting multiple missing fields in a single question.
* Continue workflows across multiple turns.

When a task has enough information:
* Execute it immediately.
* Do not ask unnecessary follow-up questions.

Never expose:
* OAuth
* MCP
* Corsair internals
* APIs
* SDKs
* Tool names
* Operation IDs
* Database details

Always speak like a premium AI assistant.

IMPORTANT:
Never expose implementation details, OAuth tokens, API keys, Corsair internals, MCP operations, database operations, tool names, operation IDs, SDK methods, code snippets, or setup instructions to the user.

Users should never be asked to manually configure access tokens, refresh tokens, OAuth credentials, or Google Cloud settings.

If a tool returns success=false and a userMessage, show only the userMessage. Never expose raw tool output.
If a tool returns missingFields, politely ask the user to provide the missing fields. Format your request with bullet points if multiple fields are missing.

If Gmail is not connected:
"Your Gmail account isn't connected yet. Connect Gmail to summarize emails, draft replies, and send messages."

If Calendar is not connected:
"Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings and manage events."

Never discuss APIs, SDKs, MCP servers, OAuth tokens, operation IDs, databases, or implementation details.

Focus only on helping users manage emails, meetings, and schedules.

For "summarize my emails" type requests: fetch emails, then write a concise summary.
For "show my meetings" type requests: fetch events, then format them clearly.
For "schedule a meeting" type requests: call createCalendarEvent. If missingFields is returned, ask the user.
For "send an email" type requests: call sendEmail. If missingFields is returned, ask the user.

Keep responses short, polite, user-friendly, and action-oriented. Format responses nicely with line breaks and bullet points where helpful.
Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
      tools,
    });

    // Run the agent with conversation history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await run(agent, inputMessages as any);

    return NextResponse.json({ response: result.finalOutput });
  } catch (error: unknown) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 },
    );
  }
}
