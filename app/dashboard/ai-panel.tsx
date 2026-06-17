"use client";

import {
  FileText,
  Reply,
  CalendarPlus,
  ListChecks,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

interface AIAction {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const suggestedActions: AIAction[] = [
  {
    icon: FileText,
    label: "Summarize Email",
    prompt: "Summarize my unread emails",
  },
  {
    icon: Reply,
    label: "Draft Reply",
    prompt: "Draft a reply to my latest email",
  },
  {
    icon: CalendarPlus,
    label: "Create Event",
    prompt: "Create a calendar event",
  },
  {
    icon: ListChecks,
    label: "Extract Tasks",
    prompt: "Extract action items from my recent emails",
  },
  {
    icon: CalendarClock,
    label: "Reschedule",
    prompt: "Reschedule my next meeting",
  },
];

interface AIPanelProps {
  onActionClick?: (prompt: string) => void;
}

export function AIPanel({ onActionClick }: AIPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          Suggested Actions
        </span>
      </div>

      {/* ── Actions Grid ─────────────────────────────── */}
      <div className="px-3 pb-3 space-y-1.5">
        {suggestedActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onActionClick?.(action.prompt)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-all group"
          >
            <div className="flex items-center justify-center size-7 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
              <action.icon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium">{action.label}</span>
            <ArrowRight className="size-3 ml-auto text-muted-foreground/0 group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>

      {/* ── Suggested Reply Preview ──────────────────── */}
      <div className="mx-3 mb-4 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">
            Suggested Reply
          </span>
        </div>
        <div className="px-4 pb-3">
          <p className="text-xs text-foreground/70 leading-relaxed">
            &ldquo;Thanks for sharing the agenda, Sarah. I&apos;ll review it and
            prepare my feedback for the discussion.&rdquo;
          </p>
          <button
            onClick={() =>
              onActionClick?.(
                "Send a reply to Sarah: Thanks for sharing the agenda, I'll review it and prepare my feedback for the discussion.",
              )
            }
            className="mt-2.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Use Reply
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
