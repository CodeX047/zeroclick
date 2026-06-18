import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";
import { checkAndIncrementUsage, LimitReachedError } from "@/server/usage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEmailBody(payload: any): { body: string; isHtml: boolean } {
  if (!payload) return { body: "", isHtml: false };

  // If the body is directly in this part
  if (payload.body && payload.body.data) {
    try {
      const base64 = payload.body.data.replace(/-/g, "+").replace(/_/g, "/");
      const bodyText = Buffer.from(base64, "base64").toString("utf-8");
      return { body: bodyText, isHtml: payload.mimeType === "text/html" };
    } catch (e) {
      console.error("Error decoding body:", e);
    }
  }

  // Recursive search
  if (payload.parts && Array.isArray(payload.parts)) {
    // 1. Search for HTML
    for (const part of payload.parts) {
      if (part.mimeType === "text/html") {
        const result = getEmailBody(part);
        if (result.body) return result;
      }
    }
    // 2. Search for plain text
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        const result = getEmailBody(part);
        if (result.body) return result;
      }
    }
    // 3. Fallback search
    for (const part of payload.parts) {
      const result = getEmailBody(part);
      if (result.body) return result;
    }
  }

  return { body: "", isHtml: false };
}

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

    // Fetch a larger pool of emails from the DB to ensure we get the newest ones
    const allData = await tenant.gmail.db.messages.search({ limit: 500 });
    
    if (!allData || allData.length === 0) {
      return NextResponse.json({ emails: [] });
    }

    // Sort chronologically by internalDate (or fallback to createdAt) in descending order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allData.sort((a: any, b: any) => {
      const dateA = a.data?.internalDate ? Number(a.data.internalDate) : new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = b.data?.internalDate ? Number(b.data.internalDate) : new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Take the 50 newest
    const data = allData.slice(0, 50);

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

      const bodyDetails = getEmailBody(msg.payload);

      return {
        id: item.entity_id || item.id || msg.id,
        sender,
        senderInitial,
        senderColor,
        subject: msg.subject || "No Subject",
        snippet: msg.snippet || "",
        body: bodyDetails.body || msg.snippet || "",
        isHtml: bodyDetails.isHtml,
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
