"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { InboxPanel } from "./inbox-panel";
import { CalendarPanel } from "./calendar-panel";
import { AIPanel } from "./ai-panel";
import { HistoryPanel } from "./history-panel";
import { SettingsPanel } from "./settings-panel";
import { HomePanel } from "./home-panel";
import { FullCalendarPanel } from "./full-calendar-panel";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");


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
                <div className="flex-[65] min-w-0 min-h-[600px]">
                  <InboxPanel />
                </div>
                <div className="flex-[35] min-w-[280px] max-w-[400px] space-y-5 hidden lg:block">
                  <CalendarPanel />
                  <AIPanel />
                </div>
              </>
            )}
            
            {activeItem === "Calendar" && (
              <div className="flex-1 min-w-0">
                <FullCalendarPanel />
              </div>
            )}
            {activeItem === "History" && (
              <div className="flex-1 min-w-0">
                <HistoryPanel />
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
