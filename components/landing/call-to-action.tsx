import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallToActionSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Ready to Supercharge Your Productivity?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join the power users who are saving hours every week. Let ZeroClick
            handle the busywork so you can focus on what matters.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                <span>Get Started for Free</span>
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <span>Watch Demo</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
