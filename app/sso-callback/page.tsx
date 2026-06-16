import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="size-8 animate-spin text-zinc-400 mb-4" />
      <p className="text-sm text-zinc-500 font-medium tracking-wide animate-pulse">Authenticating...</p>
      <AuthenticateWithRedirectCallback 
        signInForceRedirectUrl="/auth-callback"
        signUpForceRedirectUrl="/auth-callback"
      />
    </div>
  );
}
