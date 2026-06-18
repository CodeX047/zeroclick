import Link from "next/link";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Last Updated: June 18, 2026
          </p>
        </header>

        {/* Content */}
        <article className="space-y-8 text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              1. Introduction
            </h2>
            <p>
              Welcome to ZeroClick. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy governs
              our data collection, processing, and usage practices when you
              connect your Google Account (Gmail and Google Calendar) to our
              service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              2. Information We Collect
            </h2>
            <p>
              ZeroClick accesses your Google user data through secure OAuth 2.0
              protocols. We access the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400 text-sm">
              <li>
                <strong className="text-zinc-200">Gmail Messages:</strong> We
                access email headers, subjects, metadata, snippets, and email
                bodies to enable email summaries, context-aware replies, and
                dashboard displays.
              </li>
              <li>
                <strong className="text-zinc-200">
                  Google Calendar Events:
                </strong>{" "}
                We read calendar events to show your schedule on the dashboard
                and write/update events when you ask the AI Assistant to
                schedule or reschedule meetings.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              3. How We Use Your Data
            </h2>
            <p>
              We use the collected Google data solely to provide and improve the
              ZeroClick AI-driven command center features:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400 text-sm">
              <li>
                Providing email summaries and context-aware email drafting
                tools.
              </li>
              <li>
                Displaying your upcoming meetings on your personalized
                dashboard.
              </li>
              <li>
                Performing automatic conflict checking and
                scheduling/rescheduling actions requested by you via the natural
                language command bar.
              </li>
            </ul>
            <p className="text-zinc-200 font-medium">
              We do not sell, rent, or share your Google user data with third
              parties. Your data is never used for advertising, nor is it used
              to train general-purpose LLMs outside of your session context.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              4. Data Storage and Security
            </h2>
            <p>
              Your synced Gmail messages and Calendar events are securely cached
              in an isolated multi-tenant database (using Corsair SDK
              encryption) to ensure instantaneous dashboard loading times. We
              implement robust physical, technical, and administrative security
              measures designed to protect your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              5. Data Deletion and Revocation
            </h2>
            <p>
              You can disconnect your Google integrations at any time through
              the <strong>Account Settings</strong> panel in your dashboard.
              Disconnecting will immediately delete all cached calendar and
              email data from our database. Furthermore, you can revoke access
              entirely via your Google Account Security settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">
              6. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our practices, please contact us at{" "}
              <a
                href="mailto:vishalrp047@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                vishalrp047@gmail.com
              </a>
              .
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto w-full mt-16 border-t border-zinc-800 pt-6 flex justify-between text-xs text-zinc-500">
        <span>&copy; 2026 ZeroClick. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-zinc-300">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-zinc-300">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
