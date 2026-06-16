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
  const isCalendarConnected = await isIntegrationConnected(
    user.id,
    "googlecalendar",
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="max-w-md m-auto h-fit w-full">
        <div className="p-6 bg-white rounded-xl shadow-sm dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">
              Welcome to ZeroClick
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Connect your accounts to start automating work.
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div className="mt-6 p-4 rounded-md bg-green-50 text-green-800 border border-green-200 flex items-center gap-2 text-sm dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
              <CheckCircle2 className="size-4" />
              <span>
                {success === "gmail"
                  ? "Gmail"
                  : success === "googlecalendar"
                    ? "Google Calendar"
                    : "Account"}{" "}
                connected successfully!
              </span>
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
                <span className="font-medium text-sm text-green-800 dark:text-green-400">
                  Gmail Connected
                </span>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await connectIntegration("gmail");
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-start h-12 relative overflow-hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 256 193"
                    className="mr-3 ml-1"
                  >
                    <path
                      fill="#4285f4"
                      d="M58.182 192.05V93.14L27.507 65.077L0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z"
                    />
                    <path
                      fill="#34a853"
                      d="M197.818 192.05h40.727c9.659 0 17.455-7.797 17.455-17.455V49.505l-31.356 18.339l-26.826 25.296z"
                    />
                    <path
                      fill="#ea4335"
                      d="m58.182 93.14l-4.174-38.647l4.174-36.989L128 69.868l69.818-52.364l4.669 34.992l-4.669 40.644L128 145.504z"
                    />
                    <path
                      fill="#fbbc04"
                      d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-42.062-20.727z"
                    />
                    <path
                      fill="#c5221f"
                      d="M0 26.231v23.273l58.182 43.636V17.504L16.244 5.504C-1.178-7.659 0 4.646 0 26.231"
                    />
                  </svg>
                  Connect Gmail (Required)
                </Button>
              </form>
            )}

            {/* Google Calendar Connection */}
            {isCalendarConnected ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
                <span className="font-medium text-sm text-green-800 dark:text-green-400">
                  Calendar Connected
                </span>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await connectIntegration("googlecalendar");
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full justify-start h-12 relative overflow-hidden"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    id="Livello_1"
                    x="0px"
                    y="0px"
                    viewBox="0 0 200 200"
                    enableBackground="new 0 0 200 200"
                    xmlSpace="preserve"
                    className="mr-3 ml-1"
                    width="1.2em"
                    height="1.2em"
                  >
                    <g>
                      <g transform="translate(3.75 3.75)">
                        <path
                          fill="#FFFFFF"
                          d="M148.882,43.618l-47.368-5.263l-57.895,5.263L38.355,96.25l5.263,52.632l52.632,6.579l52.632-6.579 l5.263-53.947L148.882,43.618z"
                        />
                        <path
                          fill="#1A73E8"
                          d="M65.211,125.276c-3.934-2.658-6.658-6.539-8.145-11.671l9.132-3.763c0.829,3.158,2.276,5.605,4.342,7.342 c2.053,1.737,4.553,2.592,7.474,2.592c2.987,0,5.553-0.908,7.697-2.724s3.224-4.132,3.224-6.934c0-2.868-1.132-5.211-3.395-7.026 s-5.105-2.724-8.5-2.724h-5.276v-9.039H76.5c2.921,0,5.382-0.789,7.382-2.368c2-1.579,3-3.737,3-6.487 c0-2.447-0.895-4.395-2.684-5.855s-4.053-2.197-6.803-2.197c-2.684,0-4.816,0.711-6.395,2.145s-2.724,3.197-3.447,5.276 l-9.039-3.763c1.197-3.395,3.395-6.395,6.618-8.987c3.224-2.592,7.342-3.895,12.342-3.895c3.697,0,7.026,0.711,9.974,2.145 c2.947,1.434,5.263,3.421,6.934,5.947c1.671,2.539,2.5,5.382,2.5,8.539c0,3.224-0.776,5.947-2.329,8.184 c-1.553,2.237-3.461,3.947-5.724,5.145v0.539c2.987,1.25,5.421,3.158,7.342,5.724c1.908,2.566,2.868,5.632,2.868,9.211 s-0.908,6.776-2.724,9.579c-1.816,2.803-4.329,5.013-7.513,6.618c-3.197,1.605-6.789,2.421-10.776,2.421 C73.408,129.263,69.145,127.934,65.211,125.276z"
                        />
                        <path
                          fill="#1A73E8"
                          d="M121.25,79.961l-9.974,7.25l-5.013-7.605l17.987-12.974h6.895v61.197h-9.895L121.25,79.961z"
                        />
                        <path
                          fill="#EA4335"
                          d="M148.882,196.25l47.368-47.368l-23.684-10.526l-23.684,10.526l-10.526,23.684L148.882,196.25z"
                        />
                        <path
                          fill="#34A853"
                          d="M33.092,172.566l10.526,23.684h105.263v-47.368H43.618L33.092,172.566z"
                        />
                        <path
                          fill="#4285F4"
                          d="M12.039-3.75C3.316-3.75-3.75,3.316-3.75,12.039v136.842l23.684,10.526l23.684-10.526V43.618h105.263 l10.526-23.684L148.882-3.75H12.039z"
                        />
                        <path
                          fill="#188038"
                          d="M-3.75,148.882v31.579c0,8.724,7.066,15.789,15.789,15.789h31.579v-47.368H-3.75z"
                        />
                        <path
                          fill="#FBBC04"
                          d="M148.882,43.618v105.263h47.368V43.618l-23.684-10.526L148.882,43.618z"
                        />
                        <path
                          fill="#1967D2"
                          d="M196.25,43.618V12.039c0-8.724-7.066-15.789-15.789-15.789h-31.579v47.368H196.25z"
                        />
                      </g>
                    </g>
                  </svg>
                  Connect Calendar (Recommended)
                </Button>
              </form>
            )}
          </div>

          <div className="mt-10">
            <Button
              asChild
              variant={
                isGmailConnected && isCalendarConnected
                  ? "default"
                  : "secondary"
              }
              className="w-full"
            >
              <Link href="/dashboard">
                {isGmailConnected && isCalendarConnected
                  ? "Continue to Dashboard"
                  : "Continue for now"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
