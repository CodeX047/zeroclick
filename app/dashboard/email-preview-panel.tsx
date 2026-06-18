"use client";

import { Email } from "./types";
import { Mail, Reply, Calendar, FileText, Sparkles } from "lucide-react";

interface EmailPreviewPanelProps {
  email: Email | null;
}

export function EmailPreviewPanel({ email }: EmailPreviewPanelProps) {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-xl border border-border bg-card/50 text-muted-foreground p-8 text-center">
        <Mail className="size-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-foreground/80 mb-2">No Email Selected</h3>
        <p className="text-sm">Select an email from your inbox to view it here.</p>
      </div>
    );
  }
  const decodeEntities = (html: string) => {
    if (typeof window === 'undefined') {
      return html
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <div className="p-8 border-b border-border bg-background">
        <h2 className="text-[28px] leading-tight font-bold text-foreground mb-8">
          {decodeEntities(email.subject)}
        </h2>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`size-12 text-lg rounded-full ${email.senderColor} flex items-center justify-center text-white font-semibold shrink-0`}>
              {email.senderInitial}
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-base text-foreground leading-snug">{email.sender}</div>
              <div className="text-sm text-muted-foreground">to me</div>
            </div>
          </div>
          <div className="text-sm text-foreground/80 font-medium bg-muted/20 border border-border px-3 py-1 rounded-full">
            {email.time}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="text-[17px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal max-w-3xl">
          {decodeEntities(email.snippet)}
        </div>
      </div>

      {/* ── AI Action Bar ────────────────────────────── */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Suggestions</span>
        </div>
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-left group shadow-sm">
            <div className="bg-primary/10 text-primary p-2 rounded-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Reply className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Draft a reply</div>
              <div className="text-xs text-muted-foreground mt-0.5">Let AI write a contextual response</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-left group shadow-sm">
            <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded-md group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Calendar className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Create a meeting</div>
              <div className="text-xs text-muted-foreground mt-0.5">Schedule time based on this thread</div>
            </div>
          </button>

          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-left group shadow-sm">
            <div className="bg-violet-500/10 text-violet-600 p-2 rounded-md group-hover:bg-violet-500 group-hover:text-white transition-colors">
              <FileText className="size-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">Summarize it</div>
              <div className="text-xs text-muted-foreground mt-0.5">Get the key points instantly</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
