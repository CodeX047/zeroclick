"use client";

import { CommandBar } from "./command-bar";

export function HomePanel() {
  return (
    <div className="h-full w-full flex flex-col">
      <CommandBar />
    </div>
  );
}
