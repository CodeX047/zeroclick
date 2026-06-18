import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }

    const tenant = corsair.withTenant(user.id);

    await tenant.gmail.api.messages.modify({
      userId: "me",
      id,
      removeLabelIds: ["UNREAD"],
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error marking email as read:", error);
    return NextResponse.json({ error: "Failed to mark email as read" }, { status: 500 });
  }
}
