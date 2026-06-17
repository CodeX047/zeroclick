"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors"
        aria-label="Toggle theme"
      >
        <div className="size-[18px]" />
        {!collapsed && <span>Theme</span>}
      </button>
    );
  }

  // Cycle: system → light → dark → system
  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const icon =
    theme === "system" ? (
      <Monitor className="size-[18px]" />
    ) : resolvedTheme === "dark" ? (
      <Sun className="size-[18px]" />
    ) : (
      <Moon className="size-[18px]" />
    );

  const label =
    theme === "system"
      ? "System Theme"
      : theme === "dark"
        ? "Dark Mode"
        : "Light Mode";

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
      aria-label="Toggle theme"
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
