import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { CommandBar } from "./command-bar";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col relative">
      <header className="absolute top-0 right-0 p-6 z-10">
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            ZeroClick
          </h1>
          
          <CommandBar />
          
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Try asking to <span className="font-medium text-zinc-700 dark:text-zinc-300">summarize my unread emails</span> or <span className="font-medium text-zinc-700 dark:text-zinc-300">reschedule my next meeting</span>.
          </div>
        </div>
      </main>
    </div>
  );
}
