import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = corsair.withTenant(user.id);
    const { searchParams } = new URL(req.url);
    const timeMin = searchParams.get("timeMin") || new Date().toISOString();
    
    // Fetch upcoming events
    const res = await tenant.googlecalendar.api.events.getMany({
      timeMin,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50
    });

    if (!res || !res.items || res.items.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = res.items.map((event: any) => {
      const startStr = event.start?.dateTime || event.start?.date || "";
      const endStr = event.end?.dateTime || event.end?.date || "";
      
      return {
        id: event.id,
        summary: event.summary || "Untitled Event",
        start: startStr,
        end: endStr,
        isAllDay: !event.start?.dateTime,
      };
    });

    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
