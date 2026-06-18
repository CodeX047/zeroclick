import { db } from "@/db/drizzle";
import { users, userUsage } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class LimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LimitReachedError";
  }
}

export type UsageType = "ai_chat" | "email_sync" | "calendar_sync";

const PLAN_LIMITS = {
  free: { ai_chat: 5, email_sync: 30, calendar_sync: 30 },
  pro: { ai_chat: 50, email_sync: Infinity, calendar_sync: Infinity },
  ultimate: { ai_chat: Infinity, email_sync: Infinity, calendar_sync: Infinity },
};

export async function checkAndIncrementUsage(
  userId: string,
  email: string,
  type: UsageType
) {
  // Get or Create user
  let userRecord = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userRecord) {
    const inserted = await db
      .insert(users)
      .values({ id: userId, email, plan: "free" })
      .returning();
    userRecord = inserted[0];
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get or Create usage record for today
  let usageRecord = await db.query.userUsage.findFirst({
    where: and(eq(userUsage.userId, userId), eq(userUsage.date, today)),
  });

  if (!usageRecord) {
    const id = crypto.randomUUID();
    const inserted = await db
      .insert(userUsage)
      .values({ id, userId, date: today })
      .returning();
    usageRecord = inserted[0];
  }

  // Check limits
  const limits = PLAN_LIMITS[userRecord.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const currentCount =
    type === "ai_chat"
      ? usageRecord.aiChats
      : type === "email_sync"
      ? usageRecord.emailSyncs
      : usageRecord.calendarSyncs;

  const limit = limits[type];

  if (currentCount >= limit) {
    throw new LimitReachedError(`API Limit Reached - Please contact admin to upgrade your plan.`);
  }

  // Increment usage
  const updateData: any = {};
  if (type === "ai_chat") updateData.aiChats = currentCount + 1;
  else if (type === "email_sync") updateData.emailSyncs = currentCount + 1;
  else if (type === "calendar_sync") updateData.calendarSyncs = currentCount + 1;

  await db
    .update(userUsage)
    .set(updateData)
    .where(eq(userUsage.id, usageRecord.id));
}
