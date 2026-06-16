import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isIntegrationConnected, connectIntegration } from "./actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { success, error } = await searchParams;

  const isGmailConnected = await isIntegrationConnected(user.id, "gmail");
  const isCalendarConnected = await isIntegrationConnected(user.id, "googlecalendar");

  return (
    <div className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="max-w-md m-auto h-fit w-full">
        <div className="p-6 bg-white rounded-xl shadow-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">Welcome to ZeroClick</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Connect your accounts to start automating work.
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mt-6 p-4 rounded-md bg-green-50 text-green-800 border border-green-200 flex items-center gap-2 text-sm dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
              <CheckCircle2 className="size-4" />
              <span>{success === "gmail" ? "Gmail" : success === "googlecalendar" ? "Google Calendar" : "Account"} connected successfully!</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200 flex flex-col gap-1 text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="size-4" />
                <span>Failed to connect</span>
              </div>
              <p className="text-xs ml-6 opacity-80 break-words">{error}</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {/* Gmail Connection */}
            {isGmailConnected ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
                <span className="font-medium text-sm text-green-800 dark:text-green-400">Gmail Connected</span>
              </div>
            ) : (
              <form action={async () => {
                "use server";
                await connectIntegration("gmail");
              }}>
                <Button type="submit" variant="outline" className="w-full justify-start h-12 relative overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 256 193" className="mr-3 ml-1">
                    <path fill="#4285f4" d="M58.182 192.05V93.14L27.507 65.077L0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z"/>
                    <path fill="#34a853" d="M197.818 192.05h40.727c9.659 0 17.455-7.797 17.455-17.455V49.505l-31.356 18.339l-26.826 25.296z"/>
                    <path fill="#ea4335" d="m58.182 93.14l-4.174-38.647l4.174-36.989L128 69.868l69.818-52.364l4.669 34.992l-4.669 40.644L128 145.504z"/>
                    <path fill="#fbbc04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-42.062-20.727z"/>
                    <path fill="#c5221f" d="M0 26.231v23.273l58.182 43.636V17.504L16.244 5.504C-1.178-7.659 0 4.646 0 26.231"/>
                  </svg>
                  Connect Gmail (Required)
                </Button>
              </form>
            )}

            {/* Google Calendar Connection */}
            {isCalendarConnected ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
                <span className="font-medium text-sm text-green-800 dark:text-green-400">Calendar Connected</span>
              </div>
            ) : (
              <form action={async () => {
                "use server";
                await connectIntegration("googlecalendar");
              }}>
                <Button type="submit" variant="outline" className="w-full justify-start h-12 relative overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 256 256" className="mr-3 ml-1">
                    <path fill="#4285f4" d="M225.86 21.328h-31.545v213.344h31.545c11.776 0 21.328-9.552 21.328-21.328V42.656c0-11.776-9.552-21.328-21.328-21.328"/>
                    <path fill="#34a853" d="M194.315 21.328H64.088v213.344h130.227z"/>
                    <path fill="#fbbc04" d="M64.088 234.672H32.544C20.768 234.672 11.216 225.12 11.216 213.344V42.656c0-11.776 9.552-21.328 21.328-21.328h31.545z"/>
                    <path fill="#ea4335" d="M32.544 21.328c-11.776 0-21.328 9.552-21.328 21.328v170.688c0 11.776 9.552 21.328 21.328 21.328h31.545V21.328z"/>
                  </svg>
                  Connect Calendar (Recommended)
                </Button>
              </form>
            )}
          </div>

          <div className="mt-10">
            <Button asChild variant={isGmailConnected && isCalendarConnected ? "default" : "secondary"} className="w-full">
              <Link href="/dashboard">
                {isGmailConnected && isCalendarConnected ? "Continue to Dashboard" : "Continue for now"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
