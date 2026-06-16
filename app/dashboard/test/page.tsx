"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getLatestEmails, getUpcomingEvents } from "./actions";
import { Loader2 } from "lucide-react";

export default function TestIntegrationsPage() {
  const [emails, setEmails] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);
  
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [eventError, setEventError] = useState("");

  const fetchEmails = async () => {
    setLoadingEmails(true);
    setEmailError("");
    try {
      const data = await getLatestEmails();
      setEmails(data);
    } catch (err: any) {
      setEmailError(err.message || "Failed to fetch emails");
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventError("");
    try {
      const data = await getUpcomingEvents();
      setEvents(data);
    } catch (err: any) {
      setEventError(err.message || "Failed to fetch events");
    } finally {
      setLoadingEvents(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations Test</h1>
        <p className="text-muted-foreground mt-2">Verify that ZeroClick can successfully read from your connected accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gmail Section */}
        <section className="space-y-4 border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Gmail</h2>
            <Button onClick={fetchEmails} disabled={loadingEmails}>
              {loadingEmails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Latest Emails
            </Button>
          </div>

          {emailError && <p className="text-sm text-red-500">{emailError}</p>}

          <div className="space-y-4 mt-4">
            {emails === null && !loadingEmails && !emailError && (
              <p className="text-sm text-muted-foreground">No data fetched yet.</p>
            )}
            
            {emails?.map((email) => (
              <div key={email.id} className="text-sm border rounded-lg p-4 space-y-2">
                <div className="font-semibold">{email.subject}</div>
                <div className="text-xs text-muted-foreground">{email.sender}</div>
                <div className="text-xs text-muted-foreground">{new Date(email.date).toLocaleString()}</div>
                <p className="line-clamp-2 mt-2">{email.snippet}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="space-y-4 border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Calendar</h2>
            <Button onClick={fetchEvents} disabled={loadingEvents}>
              {loadingEvents && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Upcoming Events
            </Button>
          </div>

          {eventError && <p className="text-sm text-red-500">{eventError}</p>}

          <div className="space-y-4 mt-4">
            {events === null && !loadingEvents && !eventError && (
              <p className="text-sm text-muted-foreground">No data fetched yet.</p>
            )}

            {events?.map((event) => (
              <div key={event.id} className="text-sm border rounded-lg p-4 space-y-2">
                <div className="font-semibold">{event.summary}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(event.start).toLocaleString()}
                </div>
                {event.attendees?.length > 0 && (
                  <div className="text-xs mt-2">
                    <span className="font-medium">Attendees:</span> {event.attendees.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
