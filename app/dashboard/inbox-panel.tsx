"use client";

import { useState } from "react";
import { Search, Star, Mail, RefreshCw, Loader2 } from "lucide-react";
import { Email } from "./types";

const filters = ["All", "Unread", "Important", "Starred"];

interface InboxPanelProps {
  emails: Email[];
  loading: boolean;
  error: string;
  onSync: () => void;
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
}

export function InboxPanel({ emails, loading, error, onSync, selectedEmailId, onSelectEmail }: InboxPanelProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");


  const filteredEmails = emails.filter((email) => {
    if (activeFilter === "Unread") return email.unread;
    if (activeFilter === "Important") return email.important;
    if (activeFilter === "Starred") return email.starred;
    return true;
  }).filter((email) => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter((e) => e.unread).length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onSync} 
              disabled={loading}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              title="Sync Emails"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Mail className="size-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Email List ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/50 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
            <Loader2 className="size-6 text-primary animate-spin" />
          </div>
        )}
        {!loading && error && (
          <div className="p-6 text-center text-destructive text-sm">{error}</div>
        )}
        {!loading && !error && filteredEmails.length === 0 && (
          <div className="p-6 text-center text-muted-foreground text-sm">No emails found.</div>
        )}
        {filteredEmails.map((email) => (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email)}
            className={`w-full text-left px-5 py-3.5 transition-all duration-150 hover:bg-accent/50 group ${
              selectedEmailId === email.id ? "bg-accent/70" : ""
            } ${email.unread ? "" : "opacity-75"}`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`size-9 rounded-full ${email.senderColor} flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5`}>
                {email.senderInitial}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${email.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                    {email.sender}
                    {email.unread && (
                      <span className="inline-block size-1.5 rounded-full bg-primary ml-2 align-middle" />
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                    {email.time}
                  </span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${email.unread ? "text-foreground/90" : "text-muted-foreground"}`}>
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {email.snippet}
                </p>
              </div>

              {/* Indicators */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 mt-1">
                {email.important && (
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    High
                  </span>
                )}
                {email.starred && (
                  <Star className="size-3.5 text-amber-400 fill-amber-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
