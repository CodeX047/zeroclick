import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-12 px-6 md:px-12 font-sans select-none">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12">
          <Link href="/">
            <span className="text-zinc-100 text-lg font-semibold tracking-[0.18em] uppercase transition-colors hover:text-zinc-300">
              ZEROCLICK
            </span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mt-6 text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last Updated: June 18, 2026
          </p>
        </header>

        {/* Content */}
        <article className="space-y-8 text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">1. Acceptance of Terms</h2>
            <p>
              By accessing and using ZeroClick, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must refrain from using the platform immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">2. Description of Service</h2>
            <p>
              ZeroClick provides an AI-powered command center designed to aggregate and manage Gmail messages and Google Calendar events. The services include natural language processing commands, email summarization, calendar view rendering, and conflict-checking booking automation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">3. User Responsibility & Authorization</h2>
            <p>
              To utilize the service, you must securely link your Google Account via OAuth 2.0. By authorizing ZeroClick, you grant us permission to read/write to your Google Calendar and Gmail inboxes specifically to execute actions requested by you.
            </p>
            <p className="text-sm text-zinc-400">
              You are entirely responsible for keeping your login credentials (via Clerk) secure and for all actions taken under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">4. Prohibited Conduct</h2>
            <p>
              You agree not to use the service for any illegal activities, to transmit spam or malicious scripts, or to interfere with the integrity and security of our databases and connections. Attempting to bypass subscription usage limits is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">5. Limitation of Liability</h2>
            <p>
              ZeroClick is provided on an "as-is" and "as-available" basis. We do not guarantee uninterrupted service or the complete absence of bugs. In no event shall ZeroClick be liable for any indirect, incidental, or consequential damages resulting from your use of, or inability to use, our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">6. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users or our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">7. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this page. Your continued use of the service after such changes constitutes acceptance of the new terms.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full mt-16 border-t border-zinc-800 pt-6 flex justify-between text-xs text-zinc-500">
        <span>&copy; 2026 ZeroClick. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-zinc-300">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-zinc-300">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
