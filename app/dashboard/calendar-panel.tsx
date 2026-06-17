"use client";

import { Clock } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  isNow?: boolean;
}

const todayEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Product Standup",
    startTime: "9:00 AM",
    endTime: "9:30 AM",
    color: "border-l-blue-500",
  },
  {
    id: "2",
    title: "Design Review",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    color: "border-l-emerald-500",
    isNow: true,
  },
  {
    id: "3",
    title: "Lunch Break",
    startTime: "12:30 PM",
    endTime: "1:30 PM",
    color: "border-l-amber-500",
  },
  {
    id: "4",
    title: "1:1 with Sarah",
    startTime: "2:00 PM",
    endTime: "2:30 PM",
    color: "border-l-orange-500",
  },
  {
    id: "5",
    title: "Sprint Planning",
    startTime: "3:00 PM",
    endTime: "4:00 PM",
    color: "border-l-violet-500",
  },
];

export function CalendarPanel() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Today&apos;s Calendar
          </h3>
          <Clock className="size-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
      </div>

      {/* ── Events ───────────────────────────────────── */}
      <div className="px-3 pb-4 space-y-1.5">
        {todayEvents.map((event) => (
          <div
            key={event.id}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-[3px] transition-colors
              ${event.color}
              ${event.isNow
                ? "bg-primary/5 dark:bg-primary/8"
                : "bg-transparent hover:bg-accent/50"
              }
            `}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${event.isNow ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                {event.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {event.startTime} – {event.endTime}
              </p>
            </div>
            {event.isNow && (
              <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Now
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
