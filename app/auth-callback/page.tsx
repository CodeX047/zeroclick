import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isIntegrationConnected } from "@/app/onboarding/actions";

export default async function AuthCallbackPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Check if Gmail is connected
  const isGmailConnected = await isIntegrationConnected(user.id, "gmail");

  if (!isGmailConnected) {
    // If Gmail is not connected, redirect to the onboarding screen
    redirect("/onboarding");
  } else {
    // If Gmail is connected, they can go straight to the dashboard
    redirect("/dashboard");
  }
}
