"use client";

import { useState, useEffect } from "react";
import { getUserSettings, disconnectIntegration } from "./actions";
import { Button } from "@/components/ui/button";
import { Loader2, User as UserIcon, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { connectIntegration } from "@/app/onboarding/actions";

type UserSettings = {
  id: string;
  email: string;
  plan: string;
  isGmailConnected: boolean;
  isCalendarConnected: boolean;
};

export function SettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getUserSettings();
        setSettings(data);
      } catch (err) {
        setError("Failed to load settings.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleDisconnect = async (pluginName: "gmail" | "googlecalendar") => {
    setDisconnecting(pluginName);
    const res = await disconnectIntegration(pluginName);
    if (res.success) {
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              ...(pluginName === "gmail" ? { isGmailConnected: false } : {}),
              ...(pluginName === "googlecalendar"
                ? { isCalendarConnected: false }
                : {}),
            }
          : null
      );
    } else {
      setError(res.error || "Failed to disconnect.");
    }
    setDisconnecting(null);
  };

  const handleConnect = async (pluginName: "gmail" | "googlecalendar") => {
    setConnecting(pluginName);
    try {
      await connectIntegration(pluginName);
    } catch (error) {
      console.error(error);
      setError("Failed to start connection flow.");
      setConnecting(null);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/50 bg-muted/20">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <UserIcon className="size-5 text-primary" />
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and integrations.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error && !settings ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            {error}
          </div>
        ) : settings ? (
          <div className="max-w-2xl space-y-10">
            {/* Profile Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Profile Details
              </h3>
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-background">
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {settings.email}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl border border-border bg-background">
                  <div>
                    <p className="text-sm font-medium">Current Plan</p>
                    <div className="mt-1">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          settings.plan === "ultimate"
                            ? "bg-primary text-primary-foreground"
                            : settings.plan === "pro"
                            ? "bg-blue-500 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {settings.plan.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {settings.plan !== "ultimate" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/pricing">Upgrade</Link>
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* Integrations Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Connected Accounts
              </h3>

              <div className="grid gap-4">
                {/* Gmail Integration */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.2em"
                        height="1.2em"
                        viewBox="0 0 256 193"
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
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        Gmail
                        {settings.isGmailConnected && (
                          <CheckCircle2 className="size-4 text-green-500" />
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {settings.isGmailConnected
                          ? "Connected to ZeroClick"
                          : "Not connected"}
                      </p>
                    </div>
                  </div>

                  {settings.isGmailConnected ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect("gmail")}
                      disabled={disconnecting === "gmail"}
                      className="gap-2"
                    >
                      {disconnecting === "gmail" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect("gmail")}
                      disabled={connecting === "gmail"}
                      className="gap-2"
                    >
                      {connecting === "gmail" && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>

                {/* Calendar Integration */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg border border-border bg-muted/30">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        viewBox="0 0 200 200"
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
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        Google Calendar
                        {settings.isCalendarConnected && (
                          <CheckCircle2 className="size-4 text-green-500" />
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {settings.isCalendarConnected
                          ? "Connected to ZeroClick"
                          : "Not connected"}
                      </p>
                    </div>
                  </div>

                  {settings.isCalendarConnected ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect("googlecalendar")}
                      disabled={disconnecting === "googlecalendar"}
                      className="gap-2"
                    >
                      {disconnecting === "googlecalendar" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect("googlecalendar")}
                      disabled={connecting === "googlecalendar"}
                      className="gap-2"
                    >
                      {connecting === "googlecalendar" && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
