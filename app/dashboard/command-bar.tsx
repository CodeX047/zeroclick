"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CommandBar() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="relative group w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex items-center border border-zinc-200 dark:border-zinc-800 focus-within:border-primary/50 transition-colors">
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask ZeroClick... (e.g. 'Summarize my latest emails')" 
            className="w-full bg-transparent px-6 py-5 text-lg outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 rounded-2xl"
            autoFocus
            disabled={loading}
          />
          <div className="pr-4">
            <button 
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-left border border-red-100 dark:border-red-900">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-left space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            ZeroClick
          </div>
          <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
}
