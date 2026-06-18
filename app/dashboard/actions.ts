"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { corsair } from "@/server/corsair";
import { isIntegrationConnected } from "@/app/onboarding/actions";

export async function getUserSettings() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const email = user.emailAddresses[0]?.emailAddress || "Unknown";

  let userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  // Fallback if they haven't been recorded in DB yet via usage
  if (!userRecord) {
    const inserted = await db
      .insert(users)
      .values({ id: user.id, email, plan: "free" })
      .returning();
    userRecord = inserted[0];
  }

  const isGmailConnected = await isIntegrationConnected(user.id, "gmail");
  const isCalendarConnected = await isIntegrationConnected(
    user.id,
    "googlecalendar"
  );

  return {
    id: user.id,
    email,
    plan: userRecord.plan,
    isGmailConnected,
    isCalendarConnected,
  };
}

export async function disconnectIntegration(pluginName: "gmail" | "googlecalendar") {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const tenant = corsair.withTenant(user.id);

  try {
    // Clear access and refresh tokens
    await tenant[pluginName].keys.set_access_token("");
    await tenant[pluginName].keys.set_refresh_token("");
    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect integration:", error);
    return { success: false, error: "Failed to disconnect integration." };
  }
}
