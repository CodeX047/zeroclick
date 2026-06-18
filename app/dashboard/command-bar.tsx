"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Command, Mail, Calendar, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

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

type PendingAction = {
  type: string;
  to?: string;
  subject?: string;
  body?: string;
  summary?: string;
  start?: string;
  end?: string;
  completed?: boolean;
  [key: string]: unknown;
};

export function CommandBar({ initialPrompt }: CommandBarProps) {
  const [messages, setMessages] = useState<
    { role: string; content: string; pendingAction?: PendingAction }[]
  >([]);
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [prevInitialPrompt, setPrevInitialPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesEndRef = useRef<any>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem("zeroclick_chat_messages");
    const savedShowResponse = sessionStorage.getItem("zeroclick_chat_showResponse");
    const savedTimestamp = sessionStorage.getItem("zeroclick_chat_timestamp");
    
    let shouldLoad = false;
    if (savedTimestamp) {
      const age = Date.now() - parseInt(savedTimestamp, 10);
      if (age < 30 * 60 * 1000) { // 30 minutes expiry
        shouldLoad = true;
      }
    }

    if (shouldLoad && savedMessages) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMessages(JSON.parse(savedMessages));
        if (savedShowResponse) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setShowResponse(savedShowResponse === "true");
        }
      } catch {
        console.error("Failed to parse saved messages");
      }
    } else {
      sessionStorage.removeItem("zeroclick_chat_messages");
      sessionStorage.removeItem("zeroclick_chat_showResponse");
      sessionStorage.removeItem("zeroclick_chat_timestamp");
    }
    setIsHydrated(true);
  }, []);

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      sessionStorage.setItem("zeroclick_chat_messages", JSON.stringify(messages));
      sessionStorage.setItem("zeroclick_chat_showResponse", String(showResponse));
      sessionStorage.setItem("zeroclick_chat_timestamp", String(Date.now()));
    }
  }, [messages, showResponse, isHydrated]);
  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (showResponse) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, showResponse]);

  if (initialPrompt !== prevInitialPrompt) {
    setPrevInitialPrompt(initialPrompt);
    setPrompt(initialPrompt || "");
  }

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

  // If initialPrompt changes (from AI action click), focus the input
  useEffect(() => {
    if (initialPrompt) {
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
        {
          role: "assistant",
          content: data.response,
          pendingAction: data.pendingAction,
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleActionResponse = async (responseMsg: string, messageIndex: number) => {
    const updatedMessages = [...messages];
    if (updatedMessages[messageIndex].pendingAction) {
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        pendingAction: {
          ...updatedMessages[messageIndex].pendingAction!,
          type: updatedMessages[messageIndex].pendingAction!.type,
          completed: true,
        },
      };
    }

    const newMessages = [...updatedMessages, { role: "user", content: responseMsg }];
    setMessages(newMessages);
    setLoading(true);
    setError("");
    setShowResponse(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, prompt: responseMsg }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.response,
          pendingAction: data.pendingAction,
        },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (isCentered: boolean = false) => (
    <form
      onSubmit={handleSubmit}
      className={`relative group w-full ${isCentered ? "max-w-2xl mx-auto" : ""}`}
    >
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
      <div className="absolute -inset-0.5 bg-primary/10 rounded-2xl blur opacity-0 group-focus-within:opacity-60 transition-all duration-500" />

      <div className="relative glass rounded-2xl shadow-lg shadow-black/[0.03] dark:shadow-black/20 flex items-center border border-border focus-within:border-primary/30 transition-all duration-300 focus-within:glow-accent-ring bg-background">
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
  );

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          <h1 className="text-[40px] font-semibold tracking-tight text-foreground mb-8">
            ZeroClick
          </h1>
          <div className="w-full">{renderForm(true)}</div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={() => {
                setPrompt("My recent mail");
                inputRef.current?.focus();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm text-foreground/80 transition-colors"
            >
              <Mail className="size-4" /> My recent mail
            </button>
            <button
              onClick={() => {
                setPrompt("My next meeting");
                inputRef.current?.focus();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm text-foreground/80 transition-colors"
            >
              <Calendar className="size-4" /> My next meeting
            </button>
            <button
              onClick={() => {
                setPrompt("Summarize unread emails");
                inputRef.current?.focus();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/30 hover:bg-muted/50 text-sm text-foreground/80 transition-colors"
            >
              <Sparkles className="size-4" /> Summarize unread
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
            {/* ── Error ────────────────────────────────────── */}
            {error && (
              <div className="text-destructive text-sm bg-destructive/5 p-4 rounded-xl text-left border border-destructive/20 animate-fade-in-up">
                {error}
              </div>
            )}

            {/* ── Conversation Thread ──────────────────────── */}
            {messages.length > 0 && showResponse && (
              <div ref={responseRef} className="space-y-3 animate-fade-in-up">
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
                    <div className="text-sm text-foreground/80 leading-relaxed">
                      {msg.role === "assistant" ? (
                        <>
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
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-semibold"
                                >
                                  {children}
                                </a>
                              ),
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || "",
                                );
                                const inline =
                                  !match && !String(children).includes("\n");
                                return inline ? (
                                  <code
                                    className="bg-muted/80 px-1.5 py-0.5 rounded font-mono text-xs text-primary font-medium"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-black/30 border border-border/50 p-3.5 rounded-xl font-mono text-xs overflow-x-auto my-3 text-foreground/90 w-full">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {msg.pendingAction && (
                            <div className="bg-card border border-border rounded-xl p-5 my-4 shadow-sm w-full">
                              <div className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                                <Mail className="size-4" />
                                {msg.pendingAction.type === "email"
                                  ? "Email Ready"
                                  : "Event Ready"}
                              </div>

                              {msg.pendingAction.type === "email" && (
                                <div className="space-y-3 mb-6">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      To:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {msg.pendingAction.to}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      Subject:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {msg.pendingAction.subject}
                                    </span>
                                  </div>
                                  <div className="text-sm text-foreground/90 mt-4 whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50">
                                    {msg.pendingAction.body}
                                  </div>
                                </div>
                              )}

                              {msg.pendingAction.type === "calendar" && (
                                <div className="space-y-3 mb-6">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      Title:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {msg.pendingAction.summary}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      Start:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {new Date(
                                        msg.pendingAction.start!,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      End:
                                    </span>{" "}
                                    <span className="font-medium text-foreground">
                                      {new Date(
                                        msg.pendingAction.end!,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleActionResponse("Yes, execute it.", i)
                                  }
                                  disabled={msg.pendingAction.completed || loading}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {msg.pendingAction.type === "email"
                                    ? "Send"
                                    : "Confirm"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleActionResponse("Cancel action.", i)
                                  }
                                  disabled={msg.pendingAction.completed || loading}
                                  className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-4 rounded-xl border border-border bg-card mr-8">
                    <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
                      <Loader2 className="size-3 text-primary animate-spin" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Mr. Zero is thinking...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="w-full pt-4 mt-auto sticky bottom-0 bg-background/80 backdrop-blur-sm z-10 pb-4">
            {renderForm(false)}
          </div>
        </>
      )}
    </div>
  );
}
