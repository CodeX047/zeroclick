"use server";

import { corsair } from "@/server/corsair";
import { currentUser } from "@clerk/nextjs/server";

export async function getLatestEmails() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenant = corsair.withTenant(user.id);
  
  try {
    const listResponse = await tenant.gmail.api.messages.list({ maxResults: 5 });
    
    if (!listResponse.messages) return [];

    const emails = await Promise.all(
      listResponse.messages.map(async (msgStub: any) => {
        const msg = await tenant.gmail.api.messages.get({ id: msgStub.id });
        
        let subject = "No Subject";
        let sender = "Unknown";
        let date = "";

        if (msg.payload?.headers) {
          const subjectHeader = msg.payload.headers.find((h: any) => h.name.toLowerCase() === "subject");
          const fromHeader = msg.payload.headers.find((h: any) => h.name.toLowerCase() === "from");
          const dateHeader = msg.payload.headers.find((h: any) => h.name.toLowerCase() === "date");
          
          if (subjectHeader && subjectHeader.value) subject = subjectHeader.value;
          if (fromHeader && fromHeader.value) sender = fromHeader.value;
          if (dateHeader && dateHeader.value) date = dateHeader.value;
        }

        return {
          id: msg.id,
          subject,
          sender,
          snippet: msg.snippet,
          date,
        };
      })
    );

    return emails;
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
    const listResponse = await tenant.googlecalendar.api.events.getMany({
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: "startTime",
    });

    if (!listResponse.items) return [];

    return listResponse.items.map((event: any) => {
      return {
        id: event.id,
        summary: event.summary || "Untitled Event",
        start: event.start?.dateTime || event.start?.date,
        end: event.end?.dateTime || event.end?.date,
        attendees: event.attendees?.map((a: any) => a.email) || [],
      };
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    throw new Error("Failed to fetch calendar events");
  }
}
