"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Email } from "./types";
import { Mail, Reply, Calendar, FileText, Sparkles, Loader2 } from "lucide-react";

interface EmailPreviewPanelProps {
  email: Email | null;
}

export function EmailPreviewPanel({ email }: EmailPreviewPanelProps) {
  const [aiLoading, setAiLoading] = useState<"summary" | "reply" | "meeting" | null>(null);
  const [aiResult, setAiResult] = useState<{ type: string; content: string } | null>(null);

  useEffect(() => {
    setAiLoading(null);
    setAiResult(null);
  }, [email]);

  const handleAiAction = (type: "summary" | "reply" | "meeting") => {
    if (!email) return;
    setAiLoading(type);
    setAiResult(null);

    setTimeout(() => {
      setAiLoading(null);
      if (type === "summary") {
        setAiResult({
          type: "Summary",
          content: `This email is from **${email.sender}** regarding **"${email.subject}"**.\n\n**Key Takeaways:**\n• Sender is discussing or requesting updates on this thread.\n• Action required: review the details and respond as appropriate.\n• Highlight: ${email.snippet}`
        });
      } else if (type === "reply") {
        setAiResult({
          type: "Reply Draft",
          content: `Hi ${email.sender},\n\nThanks for reaching out. I've read your message about "${email.subject}" and am looking into it. I will get back to you shortly.\n\nBest regards,\nUser`
        });
      } else if (type === "meeting") {
        setAiResult({
          type: "Meeting Details",
          content: `Calendar Event Prepared:\n\n**Title:** Discussion: ${email.subject}\n**With:** ${email.sender}\n**Proposed Time:** Tomorrow at 2:00 PM (Local Time)\n\n*No schedule conflicts detected.*`
        });
      }
    }, 1200);
  };

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
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin bg-background/50">
        {/* ── AI Result Box ──────────────────────────── */}
        {(aiLoading || aiResult) && (
          <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles className="size-3.5 animate-pulse" />
                <span>AI {aiLoading ? "Thinking..." : aiResult?.type}</span>
              </div>
              {!aiLoading && (
                <button
                  onClick={() => setAiResult(null)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
            
            {aiLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Generating {aiLoading === "summary" ? "summary" : aiLoading === "reply" ? "reply draft" : "meeting details"}...</span>
              </div>
            ) : (
              <div className="text-sm text-foreground/90 leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                  }}
                >
                  {aiResult?.content || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {email.body ? (
          email.isHtml ? (
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body {
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                        color: #e4e4e7; /* default text-zinc-300 */
                        background-color: transparent;
                      }
                      a { color: #8b5cf6; text-decoration: underline; }
                      p { margin-top: 0; margin-bottom: 1em; }
                      /* Style scrollbars */
                      ::-webkit-scrollbar { width: 6px; height: 6px; }
                      ::-webkit-scrollbar-track { background: transparent; }
                      ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
                      ::-webkit-scrollbar-thumb:hover { background: #52525b; }
                    </style>
                    <script>
                      document.addEventListener("DOMContentLoaded", () => {
                        const isDark = window.parent.document.documentElement.classList.contains('dark') || 
                                       window.parent.document.body.classList.contains('dark') || 
                                       window.parent.localStorage.getItem('theme') === 'dark';
                        document.body.style.color = isDark ? '#e4e4e7' : '#18181b';
                      });
                    </script>
                  </head>
                  <body>
                    ${email.body}
                  </body>
                </html>
              `}
              className="w-full h-full border-none min-h-[400px]"
              title="Email Content"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="text-[17px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal max-w-3xl">
              {decodeEntities(email.body)}
            </div>
          )
        ) : (
          <div className="text-[17px] text-foreground/90 leading-relaxed whitespace-pre-wrap font-normal max-w-3xl">
            {decodeEntities(email.snippet)}
          </div>
        )}
      </div>

      {/* ── Action Bar (Pills) ───────────────────────── */}
      <div className="p-4 bg-muted/20 border-t border-border flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={() => handleAiAction("summary")}
          disabled={!!aiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border hover:border-violet-500/40 hover:bg-violet-500/5 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Sparkles className="size-3 text-violet-500" />
          <span>Summarize</span>
        </button>
        <button
          onClick={() => handleAiAction("reply")}
          disabled={!!aiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Reply className="size-3 text-primary" />
          <span>Reply</span>
        </button>
        <button
          onClick={() => handleAiAction("meeting")}
          disabled={!!aiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 text-xs font-medium text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Calendar className="size-3 text-emerald-500" />
          <span>Create Meeting</span>
        </button>
      </div>
    </div>
  );
}
