import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "@/server/corsair";
import { z } from "zod";
import { checkAndIncrementUsage, LimitReachedError } from "@/server/usage";
import { db } from "@/db/drizzle";
import { pendingActions } from "@/db/schema";

// How long a proposed action stays confirmable before its token expires.
const PENDING_ACTION_TTL_MS = 15 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProposedAction = Record<string, any> | undefined | null;

async function persistPendingAction(userId: string, action: ProposedAction) {
  if (!action || typeof action !== "object") return null;

  let payload: Record<string, string> | null = null;
  const type = action.type;

  if (type === "email") {
    const { to, subject, body } = action;
    if (to && subject && body) payload = { to, subject, body };
  } else if (type === "calendar") {
    const { summary, start, end } = action;
    if (summary && start && end) payload = { summary, start, end };
  } else if (type === "reschedule") {
    const { eventId, summary, start, end } = action;
    if (eventId) {
      payload = { eventId };
      if (summary) payload.summary = summary;
      if (start) payload.start = start;
      if (end) payload.end = end;
    }
  }

  if (!payload) return null;

  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + PENDING_ACTION_TTL_MS);
  await db.insert(pendingActions).values({
    id,
    userId,
    type,
    payload,
    status: "pending",
    expiresAt,
  });

  return { token: id, pendingAction: { type, ...payload } };
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await checkAndIncrementUsage(
        user.id,
        user.emailAddresses[0]?.emailAddress || "unknown@zeroclick.app",
        "ai_chat",
      );
    } catch (e) {
      if (e instanceof LimitReachedError) {
        return NextResponse.json({ response: e.message });
      }
      throw e;
    }

    const { messages, prompt, timezone = "UTC" } = await req.json();
    let localTimeStr = "";
    try {
      localTimeStr = new Date().toLocaleString("en-US", { timeZone: timezone });
    } catch {
      localTimeStr = new Date().toLocaleString("en-US", { timeZone: "UTC" });
    }
    let inputMessages = messages || [{ role: "user", content: prompt }];

    // Workaround for @openai/agents SDK bug with assistant message formatting
    if (messages && messages.length > 0) {
      const historyStr = messages
        .map(
          (m: { role: string; content: string }) =>
            `${m.role === "assistant" ? "ZeroClick" : "User"}: ${m.content}`,
        )
        .join("\n\n");
      inputMessages = [
        {
          role: "user",
          content: `[Conversation History]\n${historyStr}\n\n[End History]\n\nPlease respond to the User's last message.`,
        },
      ];
    }

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
            const listRes = await tenant.gmail.api.messages.list({
              userId: "me",
              maxResults: limit,
            });
            if (!listRes.messages || listRes.messages.length === 0)
              return { success: true, emails: [] };

            const emails = [];
            for (const msg of listRes.messages) {
              if (msg.id) {
                const fullMsg = await tenant.gmail.api.messages.get({
                  userId: "me",
                  id: msg.id,
                });
                const headers = fullMsg.payload?.headers || [];
                const subject =
                  headers.find(
                    (h: Record<string, unknown>) =>
                      (h.name as string)?.toLowerCase() === "subject",
                  )?.value || "No Subject";
                const sender =
                  headers.find(
                    (h: Record<string, unknown>) =>
                      (h.name as string)?.toLowerCase() === "from",
                  )?.value || "Unknown";

                emails.push({
                  id: fullMsg.id,
                  subject,
                  sender,
                  snippet: fullMsg.snippet || "",
                  date: fullMsg.internalDate || "",
                });
              }
            }
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
        name: "getLiveUpcomingEvents",
        description:
          "Retrieve the user's upcoming calendar events using live API data. ALWAYS use this for rescheduling, canceling, or exact queries like 'next meeting'.",
        parameters: z.object({
          limit: z.number().optional().default(10),
        }),
        execute: async ({ limit }) => {
          try {
            const res = await tenant.googlecalendar.api.events.getMany({
              timeMin: new Date().toISOString(),
              singleEvents: true,
              orderBy: "startTime",
              maxResults: limit,
            });
            if (!res || !res.items || res.items.length === 0)
              return { success: true, events: [] };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const events = res.items.map((event: any) => {
              return {
                id: event.id,
                summary: event.summary || "Untitled Event",
                start: event.start?.dateTime || event.start?.date || "",
                end: event.end?.dateTime || event.end?.date || "",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attendees: event.attendees
                  ? event.attendees.map((a: any) => a.email).filter(Boolean)
                  : [],
              };
            });
            return { success: true, events };
          } catch (error: unknown) {
            console.error("Error in getLiveUpcomingEvents:", error);
            return {
              success: false,
              userMessage: "Your Google Calendar isn't connected yet.",
            };
          }
        },
      }),
      tool({
        name: "getNextMeeting",
        description:
          "Get the absolute next upcoming meeting. Filters out past events and all-day events.",
        parameters: z.object({}),
        execute: async () => {
          try {
            const res = await tenant.googlecalendar.api.events.getMany({
              timeMin: new Date().toISOString(),
              singleEvents: true,
              orderBy: "startTime",
              maxResults: 15,
            });
            if (!res || !res.items || res.items.length === 0)
              return { success: true, event: null };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nextMeeting = res.items.filter((e: any) => {
              if (!e.start?.dateTime) return false;
              return new Date(e.start.dateTime) > new Date();
            })[0];

            if (!nextMeeting) return { success: true, event: null };

            return {
              success: true,
              event: {
                id: nextMeeting.id,
                summary: nextMeeting.summary || "Untitled",
                start: nextMeeting.start?.dateTime,
                end: nextMeeting.end?.dateTime,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attendees: nextMeeting.attendees
                  ? nextMeeting.attendees
                      .map((a: any) => a.email)
                      .filter(Boolean)
                  : [],
              },
            };
          } catch (error: unknown) {
            console.error("Error in getNextMeeting:", error);
            return {
              success: false,
              userMessage: "Your Google Calendar isn't connected yet.",
            };
          }
        },
      }),
      tool({
        name: "checkCalendarConflicts",
        description:
          "Check if there are any conflicting calendar events for a given time range. Returns conflicts and alternative open slots on the same day if conflicts exist.",
        parameters: z.object({
          startDateTime: z
            .string()
            .describe("The start date and time as an ISO 8601 string."),
          endDateTime: z
            .string()
            .describe("The end date and time as an ISO 8601 string."),
        }),
        execute: async ({ startDateTime, endDateTime }) => {
          console.info(
            "checkCalendarConflicts called with:",
            startDateTime,
            endDateTime,
          );
          try {
            const start = new Date(startDateTime);
            const end = new Date(endDateTime);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              console.warn("checkCalendarConflicts: Invalid date format");
              return { success: false, userMessage: "Invalid date format." };
            }

            const requestedStart = start.getTime();
            const requestedEnd = end.getTime();
            const duration = requestedEnd - requestedStart;

            // Query from 12 hours before to 12 hours after the requested time to avoid timezone shift issues
            const queryMin = new Date(requestedStart - 12 * 60 * 60 * 1000);
            const queryMax = new Date(requestedEnd + 12 * 60 * 60 * 1000);

            const res = await tenant.googlecalendar.api.events.getMany({
              calendarId: "primary",
              timeMin: queryMin.toISOString(),
              timeMax: queryMax.toISOString(),
              singleEvents: true,
              orderBy: "startTime",
            });

            const conflicts = [];
            const busyRanges: { start: number; end: number }[] = [];

            if (res.items) {
              for (const event of res.items) {
                const eventStartStr =
                  event.start?.dateTime || event.start?.date;
                const eventEndStr = event.end?.dateTime || event.end?.date;
                if (!eventStartStr || !eventEndStr) continue;

                const eventStart = new Date(eventStartStr).getTime();
                const eventEnd = new Date(eventEndStr).getTime();

                busyRanges.push({ start: eventStart, end: eventEnd });

                // Check for overlap
                if (eventStart < requestedEnd && eventEnd > requestedStart) {
                  conflicts.push({
                    summary: event.summary || "Untitled Event",
                    start: eventStartStr,
                    end: eventEndStr,
                  });
                }
              }
            }

            console.info(
              "checkCalendarConflicts: conflicts found:",
              conflicts.length,
            );

            if (conflicts.length === 0) {
              return { success: true, hasConflict: false };
            }

            // Find at least 3 alternative slots on the same day
            let latestConflictEnd = requestedEnd;
            for (const c of conflicts) {
              const cEnd = new Date(c.end).getTime();
              if (cEnd > latestConflictEnd) {
                latestConflictEnd = cEnd;
              }
            }

            const alternatives = [];
            let candidateStart = latestConflictEnd;
            const searchLimit = requestedEnd + 12 * 60 * 60 * 1000;

            while (alternatives.length < 3 && candidateStart < searchLimit) {
              const candidateEnd = candidateStart + duration;
              const hasOverlap = busyRanges.some(
                (r) => candidateStart < r.end && candidateEnd > r.start,
              );

              if (!hasOverlap) {
                alternatives.push({
                  start: new Date(candidateStart).toISOString(),
                  end: new Date(candidateEnd).toISOString(),
                });
              }

              candidateStart += Math.max(30 * 60 * 1000, duration);
            }

            console.info("checkCalendarConflicts alternatives:", alternatives);

            return {
              success: true,
              hasConflict: true,
              conflicts,
              alternatives,
            };
          } catch (error: unknown) {
            console.error("Error in checkCalendarConflicts:", error);
            return {
              success: false,
              userMessage: "Failed to check calendar conflicts.",
            };
          }
        },
      }),
      tool({
        name: "sendEmail",
        description:
          "Validate and STAGE an email for the user to confirm. This does NOT send the email — it only checks the fields are complete. After calling this, you MUST present the email and ask the user to confirm via a pendingAction; the email is only sent after the user explicitly confirms in the app.",
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

          return {
            success: true,
            staged: true,
            requiresConfirmation: true,
            draft: { to, subject, body },
          };
        },
      }),
      tool({
        name: "createCalendarEvent",
        description:
          "Validate and STAGE a calendar event for the user to confirm. This does NOT create the event — it only checks the fields are complete. After calling this, you MUST present the event and ask the user to confirm via a pendingAction; the event is only created after the user explicitly confirms in the app.",
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

          return {
            success: true,
            staged: true,
            requiresConfirmation: true,
            draft: { summary, startDateTime, endDateTime },
          };
        },
      }),
      tool({
        name: "rescheduleCalendarEvent",
        description:
          "Reschedule or modify an existing calendar event. You MUST have the eventId from getLiveUpcomingEvents or getNextMeeting.",
        parameters: z.object({
          eventId: z.string().describe("The unique ID of the event to modify."),
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
        execute: async ({ eventId, summary, startDateTime, endDateTime }) => {
          if (!eventId) return { success: false, missingFields: ["eventId"] };

          return {
            success: true,
            staged: true,
            requiresConfirmation: true,
            draft: { eventId, summary, startDateTime, endDateTime },
          };
        },
      }),
      tool({
        name: "isSupportedRequest",
        description:
          "Determine if the user's request is related to your domain. Call this tool to evaluate the request intent.",
        parameters: z.object({
          isEmailOrCalendarRelated: z
            .boolean()
            .describe(
              "True if the request is related to email, calendar, meetings, or scheduling. False otherwise.",
            ),
        }),
        execute: async ({ isEmailOrCalendarRelated }) => {
          if (!isEmailOrCalendarRelated) {
            return {
              success: false,
              userMessage:
                "I'm designed to manage Gmail and Google Calendar workflows. Try asking me to summarize emails, schedule meetings, draft replies, or manage your calendar.",
            };
          }
          return { success: true };
        },
      }),
    ];

    const agent = new Agent({
      name: "ZeroClick",
      model: "openrouter/free",
      instructions: `You are ZeroClick, an AI Executive Assistant for Gmail and Google Calendar.

Your purpose is to help users:
- Manage emails
- Summarize inboxes
- Draft and send emails
- Schedule meetings
- Reschedule meetings
- Manage calendars
- Find events
- Create events
- Organize communication workflows

You are NOT a general-purpose chatbot.

If a user asks questions unrelated to email, calendar, scheduling, communication, productivity workflows, or personal organization, politely redirect them.

Example:
User: "Teach me React"
Assistant:
"I’m designed to help manage your email and calendar workflows. Try asking me things like:
• Summarize my unread emails
• Show my next meeting
• Schedule a meeting tomorrow
• Draft an email reply"

Never provide tutorials, coding help, essays, general knowledge, or unrelated advice.

You have memory of the current conversation and must use previous messages when interpreting new requests. BUT IMPORTANTLY: If a user asks for their "latest" emails or calendar events, ALWAYS call your tools to fetch the freshest data. Do NOT rely on the conversation history for latest data, as their inbox may have changed in the meantime!

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

If Google Calendar is not connected:
"Your Google Calendar isn't connected yet. Connect Calendar to schedule meetings, find events, and manage your time."

Never discuss APIs, SDKs, MCP servers, OAuth tokens, operation IDs, databases, or implementation details.

Focus only on helping users manage emails, meetings, and schedules.

For commands involving:
- next meeting
- reschedule meeting
- cancel meeting
- modify event
- attendees

always use getLiveUpcomingEvents or getNextMeeting tools.
Do not use cached event data (getUpcomingEvents) for workflow-modifying operations.
For broad summaries and dashboards, getUpcomingEvents (cached data) is acceptable.

For "summarize my emails" type requests: fetch emails, then write a concise summary.
For "show my meetings" type requests: use getUpcomingEvents, then format them clearly.
For "schedule a meeting" type requests: ALWAYS call checkCalendarConflicts first. If there are no conflicts, ask for confirmation before calling createCalendarEvent. If missingFields is returned, ask the user.
For "send an email" type requests: call sendEmail. If missingFields is returned, ask the user.

SAFETY & CONFIRMATION RULES (STRICTLY ENFORCED):
1. NO DESTRUCTIVE ACTIONS: You must NEVER delete, wipe, or clear emails, calendar events, or any user data. If asked to perform such dangerous tasks, firmly decline.
2. CONFLICT CHECKING: Before calling createCalendarEvent or rescheduleCalendarEvent, you MUST always call checkCalendarConflicts first. Do NOT output intermediate messages like "Let me check for conflicts first" or wait for a second turn. Run the checkCalendarConflicts tool immediately, wait for its output, and report the conflict details (including the title and time of the conflicting meeting) along with alternative slots in your very first response. Do NOT ask for confirmation of the original conflicting time.
3. CONFIRM BEFORE SENDING/CREATING: Before calling the \`sendEmail\` or \`createCalendarEvent\` tools (or requesting the user to confirm a slot), you MUST explicitly ask the user for confirmation. 

You MUST output ALL your final responses in strictly valid JSON format.
Your output must exactly match this JSON structure:
{
  "response": "Your conversational text response here. Ask for confirmation if needed.",
  "pendingAction": { // ONLY INCLUDE THIS WHEN ASKING THE USER TO CONFIRM SENDING AN EMAIL, SCHEDULING AN EVENT, OR RESCHEDULING AN EVENT.
    "type": "email", // or "calendar" or "reschedule"
    // For emails include: "to", "subject", "body"
    // For calendar include: "summary", "start", "end"
    // For reschedule include: "eventId" (required), and any of "summary", "start", "end"
  }
}

Do not include any markdown backticks around your JSON output. Just output the raw JSON object.

CRITICAL EXECUTION RULE:
You can NEVER send an email, create an event, or reschedule an event yourself. Your tools only PREPARE these actions; the user must confirm them in the app before anything happens. Therefore:
* When an action is ready, set "pendingAction" and ask the user to confirm. Do NOT say the action is "done", "sent", "scheduled", or "rescheduled" — say it is "ready to send" / "ready to schedule" and ask them to confirm.
* The system handles execution after the user clicks confirm. You will not receive a follow-up turn for the confirmation itself.

Keep responses short, polite, user-friendly, and action-oriented.
Today's date and time is ${localTimeStr} in the user's local timezone (${timezone}). When the user specifies times or dates, ALWAYS assume they are referring to this local timezone (${timezone}). When calling tools, generate ISO 8601 strings that correctly match the user's local offset for ${timezone} (e.g. +05:30 or -04:00) so calendar slots are aligned.`,
      tools,
    });

    // Run the agent with conversation history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await run(agent, inputMessages as any);

    if (!result.finalOutput) {
      return NextResponse.json({
        response: "I'm sorry, I couldn't generate a response.",
      });
    }

    let parsedResponse;
    let pendingAction;
    try {
      const cleanOutput = result.finalOutput
        .replace(/^```(?:json)?\n?/, "")
        .replace(/```$/, "")
        .trim();
      const data = JSON.parse(cleanOutput);

      if (data.name && data.arguments) {
        // The model leaked a raw tool call instead of formatting properly
        parsedResponse =
          "I'm having trouble connecting to that service right now. Please try again.";
      } else if (data.response) {
        parsedResponse = data.response;
        pendingAction = data.pendingAction;
      } else {
        parsedResponse =
          "I processed your request, but I couldn't generate a proper response.";
      }
    } catch {
      parsedResponse = result.finalOutput;
      if (
        parsedResponse.includes('"name":') &&
        parsedResponse.includes('"arguments":')
      ) {
        parsedResponse =
          "I'm having trouble connecting to that service right now. Please try again.";
      }
    }

    let actionToken: string | undefined;
    let safePendingAction: { type: string; [k: string]: string } | undefined;
    if (pendingAction) {
      try {
        const stored = await persistPendingAction(user.id, pendingAction);
        if (stored) {
          actionToken = stored.token;
          safePendingAction = stored.pendingAction;
        }
      } catch (persistError) {
        console.error("Failed to persist pending action:", persistError);
      }
    }

    return NextResponse.json({
      response: parsedResponse,
      pendingAction: safePendingAction,
      actionToken,
    });
  } catch (error: unknown) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request. Please try again.",
      },
      { status: 500 },
    );
  }
}
