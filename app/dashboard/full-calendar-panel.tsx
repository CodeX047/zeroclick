"use client";

import { ChevronLeft, ChevronRight, Plus, RefreshCw, Loader2 } from "lucide-react";
import { CalendarEvent } from "./types";

interface FullCalendarPanelProps {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  onSync: () => void;
}

export function FullCalendarPanel({ events, loading, error, onSync }: FullCalendarPanelProps) {

  const days = [
    { day: "Monday", date: "15" },
    { day: "Tuesday", date: "16" },
    { day: "Wednesday", date: "17" },
    { day: "Thursday", date: "18", active: true },
    { day: "Friday", date: "19" },
    { day: "Saturday", date: "20" },
    { day: "Sunday", date: "21" },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12 am";
    if (i === 12) return "12 pm";
    return i > 12 ? `${i - 12} pm` : `${i} am`;
  });

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

          <button onClick={onSync} disabled={loading} className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors ml-2 disabled:opacity-50" title="Sync Events">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {/* Add Event Button */}
          <button className="flex items-center gap-2 px-5 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-full transition-colors shadow-sm ml-2">
            <Plus className="size-4" />
            <span className="text-sm font-semibold">Add Event</span>
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6 h-5">
        {loading && <span className="flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Syncing calendar...</span>}
        {!loading && error && <span className="text-destructive">{error}</span>}
        {!loading && !error && <span>{events.length} upcoming events synced.</span>}
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
        <div className="space-y-0 relative min-h-[1920px]">
          {hours.map((time, i) => (
            <div key={i} className="flex group h-20">
              <div className="w-16 text-xs text-muted-foreground font-medium pt-2 shrink-0">
                {time}
              </div>
              <div className="flex-1 border-t border-border/40 group-hover:border-border/80 transition-colors relative">
              </div>
            </div>
          ))}

          {!loading && events.map((event) => {
            if (event.isAllDay) return null;
            
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            
            const startHour = startDate.getHours();
            const startMinute = startDate.getMinutes();
            
            const top = (startHour * 80) + (startMinute / 60) * 80;
            const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
            const height = Math.max((durationMinutes / 60) * 80, 20); // min 20px
            
            const colorClasses = [
              "bg-blue-500/10 border-blue-500/30 text-blue-500", 
              "bg-emerald-500/10 border-emerald-500/30 text-emerald-500", 
              "bg-violet-500/10 border-violet-500/30 text-violet-500", 
              "bg-orange-500/10 border-orange-500/30 text-orange-500"
            ];
            const colorClass = colorClasses[startHour % colorClasses.length];

            return (
              <div 
                key={event.id}
                className={`absolute left-16 right-4 rounded-lg border p-2 overflow-hidden shadow-sm backdrop-blur-sm ${colorClass}`}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <div className="text-xs font-semibold truncate">{event.summary}</div>
                <div className="text-[10px] opacity-80 mt-0.5 font-medium">
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
