import { corsair } from "@/server/corsair";
import { processOAuthCallback } from "corsair/oauth";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error)}`);
  }

  // We must rebuild the absolute redirect URI that we provided when generating
  // In a production environment, you should use NEXT_PUBLIC_APP_URL instead.
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/corsair/oauth`
    : "http://localhost:3000/api/corsair/oauth";

  if (code && state) {
    let success = false;
    let errorMessage = "";
    
    try {
      await processOAuthCallback(corsair, { code, state, redirectUri });
      success = true;
    } catch (err: any) {
      console.error("OAuth callback failed:", err);
      errorMessage = err.message;
    }

    if (success) {
      redirect("/onboarding?success=true");
    } else {
      redirect(`/onboarding?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  redirect("/onboarding");
}
