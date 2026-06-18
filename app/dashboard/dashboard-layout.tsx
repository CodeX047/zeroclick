"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { InboxPanel } from "./inbox-panel";
import { SettingsPanel } from "./settings-panel";
import { HomePanel } from "./home-panel";
import { FullCalendarPanel } from "./full-calendar-panel";
import { EmailPreviewPanel } from "./email-preview-panel";
import { Email, CalendarEvent } from "./types";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  const [emails, setEmails] = useState<Email[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailsError, setEmailsError] = useState("");

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const fetchEmails = async () => {
    setLoadingEmails(true);
    setEmailsError("");
    try {
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Failed to fetch emails");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err: unknown) {
      console.error(err);
      setEmailsError("Could not load emails.");
    } finally {
      setLoadingEmails(false);
    }
  };

  const forceSyncEmails = async () => {
    setLoadingEmails(true);
    setEmailsError("");
    try {
      // Force live sync from Google API to the Database
      const syncRes = await fetch("/api/emails/sync", { method: "POST" });
      if (!syncRes.ok) throw new Error("Failed to force sync");
      
      // Then fetch the freshly synced data from the Database
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Failed to fetch emails");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err: unknown) {
      console.error(err);
      setEmailsError("Could not sync emails.");
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: unknown) {
      console.error(err);
      setEventsError("Could not load events.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmails();
    fetchEvents();

    const interval = setInterval(() => {
      fetchEmails();
      fetchEvents();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, []);

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);

    if (email.unread) {
      // Optimistically update local state
      setEmails((prev) => 
        prev.map((e) => e.id === email.id ? { ...e, unread: false } : e)
      );
      
      // Update selected email state to match
      setSelectedEmail({ ...email, unread: false });

      // Call API to remove UNREAD label in Gmail
      try {
        await fetch("/api/emails/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: email.id })
        });
      } catch (err) {
        console.error("Failed to mark as read in Gmail:", err);
      }
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        activeItem={activeItem}
        onSelectItem={setActiveItem}
      />

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Workspace ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="flex gap-5 p-6 h-full min-h-0">
            {activeItem === "Home" && (
              <div className="flex-1 min-w-0">
                <HomePanel />
              </div>
            )}
            
            {activeItem === "Inbox" && (
              <>
                <div className="flex-[58] min-w-0 min-h-[600px]">
                  <InboxPanel 
                    emails={emails} 
                    loading={loadingEmails} 
                    error={emailsError} 
                    onSync={forceSyncEmails}
                    selectedEmailId={selectedEmail?.id || null}
                    onSelectEmail={handleEmailSelect}
                  />
                </div>
                <div className="flex-[42] min-w-[320px] max-w-[480px] space-y-5 hidden lg:block">
                  <EmailPreviewPanel email={selectedEmail} />
                </div>
              </>
            )}
            
            {activeItem === "Calendar" && (
              <div className="flex-1 min-w-0">
                <FullCalendarPanel 
                  events={events}
                  loading={loadingEvents}
                  error={eventsError}
                  onSync={fetchEvents}
                />
              </div>
            )}

            
            {activeItem === "Settings" && (
              <div className="flex-1 min-w-0">
                <SettingsPanel />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
