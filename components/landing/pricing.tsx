import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Pricing that Scales with You
          </h1>
          <p>
            Simple tiers for individuals and teams. Easy to adjust as your
            workflows grow.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">Free</CardTitle>
              <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
              <CardDescription className="text-sm">
                Personal trial / light use
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {["Command palette", "Limited runs/day"].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="relative flex flex-col border-primary shadow-lg overflow-visible">
            <span className="absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full bg-gradient-to-r from-purple-400 to-amber-400 px-3 py-1 text-xs font-medium text-amber-950 shadow-sm ring-1 ring-inset ring-white/20">
              Popular
            </span>

            <CardHeader>
              <CardTitle className="font-medium">Pro</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                $19 / mo
              </span>
              <CardDescription className="text-sm">Power users</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-dashed" />
              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Everything in Free Plan",
                  "Unlimited commands",
                  "Priority inbox",
                  "Meeting briefs",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href="">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">Team</CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                $39 / mo
              </span>
              <CardDescription className="text-sm">
                Teams coordinating meetings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Everything in Pro Plan",
                  "Shared workflows",
                  "Team groups",
                  "Admin controls",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
