import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  // Protect the route - if no user is signed in, redirect them to the sign-in page
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 dark:bg-zinc-950">
      <header className="mx-auto max-w-5xl flex items-center justify-between bg-white p-4 shadow-sm rounded-xl dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">ZC</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        </div>
        
        {/* The UserButton automatically handles sign-out and account management */}
        <UserButton />
      </header>

      <main className="mx-auto max-w-5xl mt-6">
        <div className="rounded-xl bg-white p-6 md:p-8 shadow-sm dark:bg-zinc-900">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome, {user.firstName || "User"}! 🎉
          </h2>
          <p className="text-muted-foreground mb-8">
            You have successfully authenticated using the custom Clerk flow and reached the protected dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-5 dark:border-zinc-800">
              <h3 className="font-medium text-xs text-zinc-500 uppercase tracking-wider mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Primary Email</span>
                  <p className="text-sm font-medium">{user.emailAddresses[0]?.emailAddress}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">User ID</span>
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">{user.id}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-5 dark:border-zinc-800 bg-primary/5 border-primary/10">
              <h3 className="font-medium text-xs text-primary uppercase tracking-wider mb-4">
                Next Steps
              </h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">1</span>
                  <span>Click your profile picture top-right</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">2</span>
                  <span>Manage your account settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">3</span>
                  <span>Try signing out and back in</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
