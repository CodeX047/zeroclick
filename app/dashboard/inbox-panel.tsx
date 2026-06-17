"use client";

import { useState } from "react";
import { Search, Star, Mail } from "lucide-react";

const filters = ["All", "Unread", "Important", "Starred"];

interface Email {
  id: string;
  sender: string;
  senderInitial: string;
  senderColor: string;
  subject: string;
  snippet: string;
  time: string;
  unread: boolean;
  important: boolean;
  starred: boolean;
}

const demoEmails: Email[] = [
  {
    id: "1",
    sender: "Sarah Thompson",
    senderInitial: "S",
    senderColor: "bg-orange-500",
    subject: "Q2 Product Review – Agenda & Goals",
    snippet: "Hi team, please find the agenda for our upcoming product review...",
    time: "9:24 AM",
    unread: true,
    important: true,
    starred: false,
  },
  {
    id: "2",
    sender: "Alex Johnson",
    senderInitial: "A",
    senderColor: "bg-blue-500",
    subject: "Design System Updates",
    snippet: "We've made significant updates to the components library...",
    time: "8:45 AM",
    unread: true,
    important: false,
    starred: false,
  },
  {
    id: "3",
    sender: "Google Calendar",
    senderInitial: "G",
    senderColor: "bg-emerald-500",
    subject: "Marketing Sync",
    snippet: "Event reminder: Marketing Sync at 2:00 PM",
    time: "8:00 AM",
    unread: false,
    important: false,
    starred: false,
  },
  {
    id: "4",
    sender: "Notion",
    senderInitial: "N",
    senderColor: "bg-zinc-700",
    subject: "Project Roadmap",
    snippet: "The roadmap has been updated with new milestones for Q3...",
    time: "Yesterday",
    unread: false,
    important: false,
    starred: true,
  },
  {
    id: "5",
    sender: "Michael Chen",
    senderInitial: "M",
    senderColor: "bg-violet-500",
    subject: "User Research Findings",
    snippet: "Sharing the latest research findings from our user study...",
    time: "Yesterday",
    unread: false,
    important: false,
    starred: false,
  },
  {
    id: "6",
    sender: "Product Hunt",
    senderInitial: "P",
    senderColor: "bg-orange-500",
    subject: "New Product Launch",
    snippet: "Congrats! Your product has been featured on Product Hunt 🎉",
    time: "May 28",
    unread: false,
    important: false,
    starred: true,
  },
  {
    id: "7",
    sender: "Emily Davis",
    senderInitial: "E",
    senderColor: "bg-pink-500",
    subject: "Re: Partnership Opportunity",
    snippet: "Thanks for reaching out. I'd love to explore how we can collaborate...",
    time: "May 27",
    unread: false,
    important: false,
    starred: false,
  },
];

export function InboxPanel() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const filteredEmails = demoEmails.filter((email) => {
    if (activeFilter === "Unread") return email.unread;
    if (activeFilter === "Important") return email.important;
    if (activeFilter === "Starred") return email.starred;
    return true;
  });

  const unreadCount = demoEmails.filter((e) => e.unread).length;

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
      <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/50">
        {filteredEmails.map((email) => (
          <button
            key={email.id}
            onClick={() => setSelectedEmail(email.id)}
            className={`w-full text-left px-5 py-3.5 transition-all duration-150 hover:bg-accent/50 group ${
              selectedEmail === email.id ? "bg-accent/70" : ""
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
