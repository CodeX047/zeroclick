"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/auth-callback");
    }
  }, [isSignedIn, router]);
  
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    
    setGlobalError("");

    try {
      const { error } = await signIn.password({
        identifier: emailAddress,
        password,
      });

      if (error) {
        throw error;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: async ({ session, decorateUrl }) => {
            const destination = session?.currentTask
              ? `/sign-in/tasks/${session.currentTask.key}`
              : "/auth-callback";
            const url = decorateUrl(destination);
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        // Simple log for now, you can expand to support MFA later
        setGlobalError("MFA is not currently supported in this custom UI.");
      } else {
        console.log("Sign in not complete. Status:", signIn.status);
      }
    } catch (err: unknown) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clerkErr = err as any;
      setGlobalError(
        clerkErr?.errors?.[0]?.longMessage || clerkErr?.message || "An error occurred during sign in."
      );
    }
  };

  const handleGoogleSignIn = async () => {
    if (!signIn) return;
    try {
      const { error } = await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: "/auth-callback",
        redirectCallbackUrl: "/sso-callback",
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error("Google SSO Error:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clerkErr = err as any;
      setGlobalError(
        clerkErr?.errors?.[0]?.longMessage || clerkErr?.message || "Google Sign-In failed."
      );
    }
  };

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="max-w-92 m-auto h-fit w-full">
        <div className="p-6">
          <div>
            <Link href="/" aria-label="go home">
              <span className="text-foreground text-lg font-semibold tracking-[0.18em] uppercase transition-colors duration-300">
                ZEROCLICK
              </span>
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Sign In to ZeroClick
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Welcome back! Sign in to continue</p>
          </div>

          <div className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignIn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
                className="mr-2"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              Or continue With
            </span>
            <hr className="border-dashed" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input 
                type="email" 
                required 
                name="email" 
                id="email" 
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
              {errors?.fields?.identifier && <p className="text-sm text-red-500">{errors.fields.identifier.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="block text-sm">
                Password
              </Label>
              <Input 
                type="password" 
                required 
                name="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors?.fields?.password && <p className="text-sm text-red-500">{errors.fields.password.message}</p>}
            </div>

            {globalError && !errors?.fields?.identifier && !errors?.fields?.password && (
              <p className="text-sm text-red-500">{globalError}</p>
            )}

            <Button type="submit" className="w-full" disabled={fetchStatus === "fetching"}>
              {fetchStatus === "fetching" ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </div>

        <p className="text-accent-foreground text-center text-sm">
          Don&apos;t have an account ?
          <Button asChild variant="link" className="px-2">
            <Link href="/sign-up">Create account</Link>
          </Button>
        </p>

        <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </section>
  );
}
