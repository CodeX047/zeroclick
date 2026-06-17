"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { CommandBar } from "./command-bar";
import { RecentActivity } from "./recent-activity";
import { InboxPanel } from "./inbox-panel";
import { CalendarPanel } from "./calendar-panel";
import { AIPanel } from "./ai-panel";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPrompt, setCommandPrompt] = useState("");

  const handleActionClick = useCallback((prompt: string) => {
    setCommandPrompt(prompt);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* ── Sidebar ──────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Sticky Command Area ────────────────────── */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 pt-5 pb-4 space-y-4">
          <CommandBar
            key={commandPrompt}
            initialPrompt={commandPrompt}
          />
          <RecentActivity />
        </div>

        {/* ── Workspace ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="flex gap-5 p-6 h-full min-h-0">
            {/* Left Column — Inbox (65%) */}
            <div className="flex-[65] min-w-0 min-h-[600px]">
              <InboxPanel />
            </div>

            {/* Right Column — Calendar + AI (35%) */}
            <div className="flex-[35] min-w-[280px] max-w-[400px] space-y-5 hidden lg:block">
              <CalendarPanel />
              <AIPanel onActionClick={handleActionClick} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
