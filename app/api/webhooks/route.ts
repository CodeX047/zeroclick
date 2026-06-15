import { processWebhook } from "corsair";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { corsair } from "@/server/corsair";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const contentType = req.headers.get("content-type");

  let body: string | Record<string, unknown>;

  if (contentType?.includes("application/json")) {
    body = await req.json();
  } else {
    const text = await req.text();
    body = text && text.trim() ? text : {};
  }

  const tenantId =
    url.searchParams.get("tenantId") ||
    url.searchParams.get("tenant_id") ||
    undefined;

  const result = await processWebhook(corsair, headers, body, { tenantId });

  console.info("Plugin Processed:", result.plugin, result.action);

  const responseHeaders = result.responseHeaders;
  const nextHeaders = new Headers();
  if (responseHeaders) {
    for (const [key, value] of Object.entries(responseHeaders)) {
      nextHeaders.set(key, value);
    }
  }

  if (!result.response) {
    return NextResponse.json(
      {
        success: false,
        message: "No matching webhook handlers found",
      },
      { status: 404 },
    );
  }

  if (result.response !== undefined) {
    return NextResponse.json(result.response, { headers: nextHeaders });
  }

  return new NextResponse(null, { status: 200, headers: nextHeaders });
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
