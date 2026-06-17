"use client";

import { CommandBar } from "./command-bar";

export function HomePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-4 min-h-[500px]">
      {/* ZeroClick Title */}
      <h1 className="text-[40px] font-semibold tracking-tight text-foreground mb-8">
        ZeroClick
      </h1>

      {/* Command Bar */}
      <div className="w-full">
        <CommandBar />
      </div>

      {/* Helper Text */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Try asking to <span className="font-medium text-foreground">summarize my unread emails</span> or <span className="font-medium text-foreground">reschedule my next meeting</span>.
      </p>
    </div>
  );
}
