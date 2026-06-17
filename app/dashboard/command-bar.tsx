"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Command } from "lucide-react";

const placeholderExamples = [
  "Summarize my unread emails",
  "Schedule a meeting tomorrow at 11 AM",
  "Reply to Sarah and send the agenda",
  "Reschedule my next meeting",
  "Draft a follow-up email to the team",
  "What's on my calendar today?",
];

interface CommandBarProps {
  initialPrompt?: string;
}

export function CommandBar({ initialPrompt }: CommandBarProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // If initialPrompt changes (from AI action click), update prompt
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      inputRef.current?.focus();
    }
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);
    setError("");
    setShowResponse(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages, prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ── Command Bar ──────────────────────────────── */}
      <form onSubmit={handleSubmit} className="relative group w-full">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
        <div className="absolute -inset-0.5 bg-primary/10 rounded-2xl blur opacity-0 group-focus-within:opacity-60 transition-all duration-500" />

        <div className="relative glass rounded-2xl shadow-lg shadow-black/[0.03] dark:shadow-black/20 flex items-center border border-border focus-within:border-primary/30 transition-all duration-300 focus-within:glow-accent-ring">
          {/* Sparkle icon */}
          <div className="pl-5 pr-1">
            <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
              <svg
                className="size-3 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
              </svg>
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask ZeroClick... "${placeholderExamples[placeholderIndex]}"`}
            className="w-full bg-transparent px-3 py-4 text-[15px] outline-none placeholder:text-muted-foreground/50 text-foreground rounded-2xl"
            disabled={loading}
          />

          <div className="flex items-center gap-2 pr-4">
            {/* Keyboard shortcut */}
            <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground/60 bg-muted/60 px-1.5 py-1 rounded-md font-mono border border-border/50">
              <Command className="size-2.5" />K
            </kbd>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Error ────────────────────────────────────── */}
      {error && (
        <div className="text-destructive text-sm bg-destructive/5 p-4 rounded-xl text-left border border-destructive/20 animate-fade-in-up">
          {error}
        </div>
      )}

      {/* ── Conversation Thread ──────────────────────── */}
      {messages.length > 0 && showResponse && (
        <div
          ref={responseRef}
          className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin animate-fade-in-up"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border transition-all ${
                msg.role === "user"
                  ? "bg-muted/30 border-border/50 ml-8"
                  : "bg-card border-border mr-8"
              } text-left`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {msg.role === "assistant" ? (
                  <div className="flex items-center gap-1.5">
                    <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <svg
                        className="size-3 text-primary"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      ZeroClick
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    You
                  </span>
                )}
              </div>
              <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-card mr-8">
              <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
                <Loader2 className="size-3 text-primary animate-spin" />
              </div>
              <span className="text-xs text-muted-foreground">
                ZeroClick is thinking...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
