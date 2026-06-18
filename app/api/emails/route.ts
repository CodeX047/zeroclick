import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";
import { checkAndIncrementUsage, LimitReachedError } from "@/server/usage";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = corsair.withTenant(user.id);

    try {
      await checkAndIncrementUsage(
        user.id,
        user.emailAddresses[0]?.emailAddress || "unknown@zeroclick.app",
        "email_sync"
      );
    } catch (e) {
      if (e instanceof LimitReachedError) {
        return NextResponse.json({ error: e.message }, { status: 429 });
      }
      throw e;
    }

    // Fetch the latest emails
    const data = await tenant.gmail.db.messages.search({ limit: 50 });
    
    if (!data || data.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emails = data.map((item: any) => {
      const msg = item.data || {};
      
      // Parse out the sender name and initial
      const senderFull = msg.from || "Unknown";
      let sender = senderFull;
      let senderInitial = "?";
      
      if (senderFull.includes("<")) {
        sender = senderFull.split("<")[0].replace(/"/g, "").trim();
      }
      if (sender.length > 0) {
        senderInitial = sender.charAt(0).toUpperCase();
      }

      // Generate a deterministic color based on the sender's name
      const colors = ["bg-orange-500", "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-pink-500", "bg-rose-500", "bg-cyan-500"];
      const colorIndex = sender.length % colors.length;
      const senderColor = colors[colorIndex];

      // Format time
      const dateStr = msg.createdAt || item.created_at || new Date().toISOString();
      const dateObj = new Date(dateStr);
      let time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const now = new Date();
      if (dateObj.toDateString() !== now.toDateString()) {
        time = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      return {
        id: item.entity_id || item.id || msg.id,
        sender,
        senderInitial,
        senderColor,
        subject: msg.subject || "No Subject",
        snippet: msg.snippet || "",
        time,
        unread: msg.labelIds ? msg.labelIds.includes("UNREAD") : false,
        important: msg.labelIds ? msg.labelIds.includes("IMPORTANT") : false,
        starred: msg.labelIds ? msg.labelIds.includes("STARRED") : false,
      };
    });

    return NextResponse.json({ emails });
  } catch (error: unknown) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}
