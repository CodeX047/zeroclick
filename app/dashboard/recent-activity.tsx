"use client";

import { CheckCircle2 } from "lucide-react";

const recentCommands = [
  { action: "Summarized 12 emails", time: "2m ago" },
  { action: "Scheduled Design Review", time: "15m ago" },
  { action: "Sent Follow-up Email", time: "1h ago" },
  { action: "Rescheduled Team Meeting", time: "2h ago" },
  { action: "Created Calendar Event", time: "3h ago" },
];

export function RecentActivity() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Recent Commands
        </h3>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-thin pb-1">
        {recentCommands.map((cmd, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-border bg-card hover:bg-accent/50 transition-colors shrink-0 group cursor-default"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs text-foreground/80 whitespace-nowrap font-medium">
              {cmd.action}
            </span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {cmd.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
