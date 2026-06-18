import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = corsair.withTenant(user.id);

    // Fetch the latest 15 emails from Google API, which automatically
    // saves them to the Corsair DB under the hood.
    const listRes = await tenant.gmail.api.messages.list({ maxResults: 15 });
    
    if (listRes.messages) {
      // Fetch details for each to ensure full message body & headers are cached
      const fetchPromises = listRes.messages.map((msg) => {
        if (msg.id) {
          return tenant.gmail.api.messages.get({ id: msg.id }).catch((e) => {
             console.warn(`Failed to sync message ${msg.id}:`, e);
          });
        }
        return Promise.resolve();
      });
      await Promise.all(fetchPromises);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error forcing sync:", error);
    return NextResponse.json({ error: "Failed to force sync" }, { status: 500 });
  }
}
