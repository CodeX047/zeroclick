import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
          
          <div className="relative group w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex items-center border border-zinc-200 dark:border-zinc-800 focus-within:border-primary/50 transition-colors">
              <input 
                type="text" 
                placeholder="Ask ZeroClick..." 
                className="w-full bg-transparent px-6 py-5 text-lg outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 rounded-2xl"
                autoFocus
              />
              <div className="pr-4">
                <button className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Try asking to <span className="font-medium text-zinc-700 dark:text-zinc-300">summarize my unread emails</span> or <span className="font-medium text-zinc-700 dark:text-zinc-300">reschedule my next meeting</span>.
          </div>
        </div>
      </main>
    </div>
  );
}
