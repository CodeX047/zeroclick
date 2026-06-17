"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Inbox,
  Calendar,
  ListTodo,
  Sparkles,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isGmailConnected?: boolean;
  isCalendarConnected?: boolean;
}

const navItems = [
  { icon: Inbox, label: "Inbox", href: "/dashboard", badge: 12 },
  { icon: Calendar, label: "Calendar", href: "/dashboard" },
  { icon: ListTodo, label: "Tasks", href: "/dashboard" },
  { icon: Sparkles, label: "AI Assistant", href: "/dashboard", shortcut: "⌘/" },
  { icon: Clock, label: "History", href: "/dashboard" },
  { icon: Settings, label: "Settings", href: "/dashboard" },
];

export function Sidebar({
  collapsed,
  onToggle,
  isGmailConnected = true,
  isCalendarConnected = true,
}: SidebarProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("Inbox");

  return (
    <aside
      className={`
        relative flex flex-col h-full border-r border-border
        bg-sidebar transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[68px]" : "w-[240px]"}
      `}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground shrink-0">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold tracking-tight text-foreground truncate">
              ZeroClick
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">
              AI Command Center
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ──────────────────────────── */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[70px] z-50 flex items-center justify-center size-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3" />
        ) : (
          <ChevronLeft className="size-3" />
        )}
      </button>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeItem === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`
                flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-200
                ${collapsed ? "justify-center px-0" : ""}
                ${
                  isActive
                    ? "bg-accent text-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <item.icon className={`size-[18px] ${isActive ? "text-primary" : ""}`} />
                {isActive && (
                  <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full" />
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {item.shortcut && (
                    <kbd className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Connected Accounts ───────────────────────── */}
      <div className="px-3 py-3 border-t border-border space-y-2">
        {!collapsed && (
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Connected
          </p>
        )}
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md ${collapsed ? "justify-center px-0" : ""}`}
          title={collapsed ? "Gmail Connected" : undefined}
        >
          <CheckCircle2
            className={`size-3.5 shrink-0 ${isGmailConnected ? "text-emerald-500" : "text-muted-foreground/40"}`}
          />
          {!collapsed && (
            <span
              className={`text-xs ${isGmailConnected ? "text-foreground/70" : "text-muted-foreground/50"}`}
            >
              Gmail
            </span>
          )}
        </div>
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md ${collapsed ? "justify-center px-0" : ""}`}
          title={collapsed ? "Calendar Connected" : undefined}
        >
          <CheckCircle2
            className={`size-3.5 shrink-0 ${isCalendarConnected ? "text-emerald-500" : "text-muted-foreground/40"}`}
          />
          {!collapsed && (
            <span
              className={`text-xs ${isCalendarConnected ? "text-foreground/70" : "text-muted-foreground/50"}`}
            >
              Calendar
            </span>
          )}
        </div>
      </div>

      {/* ── Theme Toggle ─────────────────────────────── */}
      <div className="px-3 pb-2">
        <ThemeToggle collapsed={collapsed} />
      </div>

      {/* ── User ─────────────────────────────────────── */}
      <div className={`px-4 py-3 border-t border-border flex items-center gap-3 ${collapsed ? "justify-center px-0" : ""}`}>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8",
            },
          }}
        />
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-foreground truncate">Account</span>
            <span className="text-[10px] text-muted-foreground truncate">Manage</span>
          </div>
        )}
      </div>
    </aside>
  );
}
