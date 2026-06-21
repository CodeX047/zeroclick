import { corsair } from "@/server/corsair";

type Tenant = ReturnType<typeof corsair.withTenant>;

export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function encodeHeaderValue(value: string): string {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  const encoded = Buffer.from(value, "utf-8").toString("base64");
  return `=?UTF-8?B?${encoded}?=`;
}

export type EmailPayload = { to: string; subject: string; body: string };
export type CalendarPayload = {
  summary: string;
  start: string;
  end: string;
};
export type ReschedulePayload = {
  eventId: string;
  summary?: string;
  start?: string;
  end?: string;
};

export async function executeSendEmail(tenant: Tenant, payload: EmailPayload) {
  const safeTo = sanitizeHeaderValue(payload.to);
  const safeSubject = encodeHeaderValue(sanitizeHeaderValue(payload.subject));

  const encodedBody = Buffer.from(payload.body, "utf-8")
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");

  const rawMessage = [
    `To: ${safeTo}`,
    `Subject: ${safeSubject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");

  const encodedMessage = Buffer.from(rawMessage, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await tenant.gmail.api.messages.send({
    userId: "me",
    raw: encodedMessage,
  });
}

// Actually create the calendar event. Only invoked from the confirm endpoint.
export async function executeCreateCalendarEvent(
  tenant: Tenant,
  payload: CalendarPayload,
) {
  await tenant.googlecalendar.api.events.create({
    calendarId: "primary",
    event: {
      summary: payload.summary,
      start: { dateTime: payload.start },
      end: { dateTime: payload.end },
    },
  });
}

export async function executeRescheduleCalendarEvent(
  tenant: Tenant,
  payload: ReschedulePayload,
) {
  const existingEvent = await tenant.googlecalendar.api.events.get({
    calendarId: "primary",
    id: payload.eventId,
  });
  if (!existingEvent) throw new Error("Event not found");

  await tenant.googlecalendar.api.events.update({
    calendarId: "primary",
    id: payload.eventId,
    event: {
      ...existingEvent,
      ...(payload.summary && { summary: payload.summary }),
      ...(payload.start && {
        start: { ...existingEvent.start, dateTime: payload.start },
      }),
      ...(payload.end && {
        end: { ...existingEvent.end, dateTime: payload.end },
      }),
    },
  });
}
