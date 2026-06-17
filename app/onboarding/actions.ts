"use server";

import { corsair } from "@/server/corsair";
import { generateOAuthUrl } from "corsair/oauth";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { setupCorsair } from "corsair";

export async function isIntegrationConnected(tenantId: string, pluginName: "gmail" | "googlecalendar") {
  try {
    const tenant = corsair.withTenant(tenantId);
    const refreshToken = await tenant[pluginName].keys.get_refresh_token();
    return !!refreshToken;
  } catch {
    return false;
  }
}

export async function connectIntegration(pluginName: "gmail" | "googlecalendar") {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Ensure the tenant exists in Corsair DB before we do anything
  await setupCorsair(corsair, { tenantId: user.id });

  // In development we use localhost. For production, you would use your actual app domain.
  // The port could vary, but usually Next.js runs on 3000 locally.
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/corsair/oauth`
    : "http://localhost:3000/api/corsair/oauth";

  let oauthUrl = "";
  try {
    const { url } = await generateOAuthUrl(corsair, pluginName, {
      tenantId: user.id,
      redirectUri,
    });
    oauthUrl = url;
  } catch (err: unknown) {
    console.error("Failed to generate OAuth URL:", err);
    // Likely missing client_id/secret for the plugin in the Corsair DB.
    const message = err instanceof Error ? err.message : String(err);
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  // Redirect must be called outside try/catch because Next.js uses errors to interrupt control flow
  if (oauthUrl) {
    redirect(oauthUrl);
  }
}
