"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export function FullCalendarPanel() {
  const days = [
    { day: "Monday", date: "15" },
    { day: "Tuesday", date: "16" },
    { day: "Wednesday", date: "17" },
    { day: "Thursday", date: "18", active: true },
    { day: "Friday", date: "19" },
    { day: "Saturday", date: "20" },
    { day: "Sunday", date: "21" },
  ];

  const hours = [
    "2 am", "3 am", "4 am", "5 am", "6 am", "7 am",
    "8 am", "9 am", "10 am", "11 am", "12 pm", "1 pm",
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background/50 rounded-xl border border-border p-8 overflow-hidden">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight">June 2026</h2>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50">
            <button className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors">
              Month
            </button>
            <button className="px-4 py-1.5 text-sm font-medium bg-background text-foreground shadow-sm rounded-full transition-colors">
              Week
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors">
              Day
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors">
              <ChevronLeft className="size-4" />
            </button>
            <button className="px-5 py-2 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors">
              Today
            </button>
            <button className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Add Event Button */}
          <button className="flex items-center gap-2 px-5 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-full transition-colors shadow-sm ml-2">
            <Plus className="size-4" />
            <span className="text-sm font-semibold">Add Event</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        Loading your calendar...
      </div>

      {/* ── Date Picker Row ──────────────────────────── */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 scrollbar-thin">
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center w-24 py-4 rounded-3xl transition-all cursor-pointer ${
              d.active 
                ? "bg-foreground text-background shadow-md scale-105" 
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <span className={`text-xs font-medium mb-1 ${d.active ? "opacity-80" : ""}`}>
              {d.day}
            </span>
            <span className={`text-2xl font-bold ${d.active ? "text-background" : "text-foreground"}`}>
              {d.date}
            </span>
          </div>
        ))}
      </div>

      {/* ── Timeline Grid ────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-4 relative">
        <div className="space-y-0">
          {hours.map((time, i) => (
            <div key={i} className="flex group h-20">
              <div className="w-16 text-xs text-muted-foreground font-medium pt-2 shrink-0">
                {time}
              </div>
              <div className="flex-1 border-t border-border/40 group-hover:border-border/80 transition-colors relative">
                {/* Event placeholder could go here */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
