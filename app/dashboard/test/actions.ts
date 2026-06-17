"use server";

import { corsair } from "@/server/corsair";
import { currentUser } from "@clerk/nextjs/server";

export async function getLatestEmails() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = corsair.withTenant(user.id);
  
  try {
    const data = await tenant.gmail.db.messages.search({ limit: 5 });
    
    if (!data || data.length === 0) return [];
    
    console.log("DB_EMAIL:", JSON.stringify(data[0], null, 2));

    return data.map((item: any) => {
      const msg = item.data || {};
      return {
        id: item.entity_id || item.id || msg.id,
        subject: msg.subject || "No Subject",
        sender: msg.from || "Unknown",
        snippet: msg.snippet || "",
        date: msg.createdAt || item.created_at || new Date().toISOString(),
      };
    });


  } catch (err) {
    console.error("Error fetching emails:", err);
    throw new Error("Failed to fetch emails");
  }
}

export async function getUpcomingEvents() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = corsair.withTenant(user.id);

  try {
    const data = await tenant.googlecalendar.db.events.search({ limit: 5 });

    if (!data || data.length === 0) return [];
    
    console.log("DB_EVENT:", JSON.stringify(data[0], null, 2));

    return data.map((item: any) => {
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
  } catch (err) {
    console.error("Error fetching events:", err);
    throw new Error("Failed to fetch calendar events");
  }
}

export async function sendTestEmail(to: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = corsair.withTenant(user.id);

  try {
    const rawMessage = `To: ${to}\r\nSubject: Test from ZeroClick\r\n\r\nThis is a test message from the ZeroClick integration test.`;
    const encodedMessage = Buffer.from(rawMessage).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    await tenant.gmail.api.messages.send({
      userId: "me",
      raw: encodedMessage,
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error sending test email:", err);
    throw new Error("Failed to send test email");
  }
}

export async function createTestEvent(summary: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = corsair.withTenant(user.id);

  try {
    const start = new Date();
    start.setDate(start.getDate() + 1); // Tomorrow
    start.setHours(10, 0, 0, 0); // 10 AM

    const end = new Date(start);
    end.setHours(11, 0, 0, 0); // 11 AM

    await tenant.googlecalendar.api.events.create({
      calendarId: "primary",
      event: {
        summary: summary,
        start: {
          dateTime: start.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: "UTC",
        },
      },
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error creating test event:", err);
    throw new Error("Failed to create calendar event");
  }
}

export async function resyncEmails() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const tenant = corsair.withTenant(user.id);
  
  try {
    await tenant.gmail.api.messages.list({ maxResults: 5 });
    return { success: true };
  } catch (err) {
    console.error("Error resyncing emails:", err);
    throw new Error("Failed to resync emails");
  }
}

export async function resyncEvents() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  const tenant = corsair.withTenant(user.id);
  
  try {
    await tenant.googlecalendar.api.events.getMany({
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: "startTime",
    });
    return { success: true };
  } catch (err) {
    console.error("Error resyncing events:", err);
    throw new Error("Failed to resync events");
  }
}
