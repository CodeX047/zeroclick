import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { pendingActions } from "@/db/schema";
import { corsair } from "@/server/corsair";
import {
  executeCreateCalendarEvent,
  executeRescheduleCalendarEvent,
  executeSendEmail,
  type CalendarPayload,
  type EmailPayload,
  type ReschedulePayload,
} from "@/server/google-actions";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "A confirmation token is required." },
        { status: 400 },
      );
    }

    const claimed = await db
      .update(pendingActions)
      .set({ status: "consumed" })
      .where(
        and(
          eq(pendingActions.id, token),
          eq(pendingActions.userId, user.id),
          eq(pendingActions.status, "pending"),
          gt(pendingActions.expiresAt, new Date()),
        ),
      )
      .returning();

    if (claimed.length === 0) {
      return NextResponse.json(
        {
          error:
            "This action has expired or was already handled. Please ask me again.",
        },
        { status: 409 },
      );
    }

    const action = claimed[0];
    const tenant = corsair.withTenant(user.id);

    try {
      if (action.type === "email") {
        const payload = action.payload as EmailPayload;
        if (!payload?.to || !payload?.subject || !payload?.body) {
          throw new Error("Incomplete email action.");
        }
        await executeSendEmail(tenant, payload);
        return NextResponse.json({
          success: true,
          response: `Done — your email to ${payload.to} has been sent.`,
        });
      }

      if (action.type === "calendar") {
        const payload = action.payload as CalendarPayload;
        if (!payload?.summary || !payload?.start || !payload?.end) {
          throw new Error("Incomplete calendar action.");
        }
        await executeCreateCalendarEvent(tenant, payload);
        return NextResponse.json({
          success: true,
          response: `Done — "${payload.summary}" is on your calendar.`,
        });
      }

      if (action.type === "reschedule") {
        const payload = action.payload as ReschedulePayload;
        if (!payload?.eventId) {
          throw new Error("Incomplete reschedule action.");
        }
        await executeRescheduleCalendarEvent(tenant, payload);
        return NextResponse.json({
          success: true,
          response: "Done — your event has been updated.",
        });
      }

      throw new Error(`Unsupported action type: ${action.type}`);
    } catch (execError: unknown) {
      console.error("Failed to execute confirmed action:", execError);
      await db
        .update(pendingActions)
        .set({ status: "failed" })
        .where(eq(pendingActions.id, action.id));
      return NextResponse.json(
        {
          error:
            "I couldn't complete that action. Please make sure your account is connected and try again.",
        },
        { status: 502 },
      );
    }
  } catch (error: unknown) {
    console.error("Confirm action error:", error);
    return NextResponse.json(
      { error: "Failed to process confirmation." },
      { status: 500 },
    );
  }
}
