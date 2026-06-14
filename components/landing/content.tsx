import Image from "next/image";
import { Chaicode } from "@/components/ui/svgs/chaicode";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
          Manage your workflows with commands, not clicks.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
          <div className="relative mb-6 sm:mb-0">
            <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="/cmail-dark.png"
                className="hidden rounded-[15px] dark:block"
                alt="payments illustration dark"
                width={1207}
                height={929}
              />
              <Image
                src="/cmail-light.png"
                className="rounded-[15px] shadow dark:hidden"
                alt="payments illustration light"
                width={1207}
                height={929}
              />
            </div>
          </div>

          <div className="relative space-y-4">
            <p className="text-muted-foreground">
              ZeroClick uses Gemini Flash to understand complex, multi-step
              requests.{" "}
              <span className="text-accent-foreground font-bold">
                It connects directly to your favorite apps
              </span>{" "}
              bringing Gmail and Google Calendar together into one intelligent
              command center.
            </p>
            <p className="text-muted-foreground">
              From scheduling meetings with your team to drafting and sending
              emails, ZeroClick handles the busywork instantly without you ever
              needing to switch tabs.
            </p>

            <div className="pt-6">
              <blockquote className="border-l-4 pl-4">
                <p>
                  "ZeroClick has fundamentally changed how I work. What used to
                  take 10 minutes of clicking through tabs and copying
                  information now happens instantly with a single command. It's
                  an absolute game-changer."
                </p>

                <div className="mt-6 space-y-3">
                  <cite className="block font-medium">
                    Hitesh Choudhary , Founder
                  </cite>
                  <Chaicode height={48} width={160} className="mt-2" />
                </div>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
