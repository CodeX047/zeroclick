import { Terminal, Sparkles, Workflow, Mail, Calendar, Zap } from 'lucide-react'
import Image from 'next/image'

export default function FeaturesSection() {
    return (
        <section className="overflow-hidden py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-semibold lg:text-5xl">Commands, Not Clicks</h2>
                    <p className="mt-6 text-lg">ZeroClick brings Gmail and Google Calendar together into one AI-powered command center. Automate workflows with a single command.</p>
                </div>
                <div className="mask-b-from-75% mask-l-from-75% mask-b-to-95% mask-l-to-95% relative -mx-4 pr-3 pt-3 md:-mx-12">
                    <div className="perspective-midrange">
                        <div className="rotate-x-6 -skew-2">
                            <div className="aspect-88/36 relative">
                                <Image
                                    src="/mail-dark.png"
                                    className="hidden dark:block"
                                    alt="mail illustration dark"
                                    width={2797}
                                    height={1137}
                                />
                                <Image
                                    src="/mail-light.png"
                                    className="dark:hidden"
                                    alt="mail illustration light"
                                    width={2797}
                                    height={1137}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mx-auto grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Terminal className="size-4" />
                            <h3 className="text-sm font-medium">Command Palette</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Do anything in one command.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">AI Executive Assistant</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Draft, summarize, prepare, and prioritize.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Workflow className="size-4" />
                            <h3 className="text-sm font-medium">Workflow Automation</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Reusable multi-step routines.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Mail className="size-4" />
                            <h3 className="text-sm font-medium">Gmail Integration</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Search, draft, and send emails with real data.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <h3 className="text-sm font-medium">Calendar Integration</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Create/edit events, invites, and detect conflicts.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Realtime Sync</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Instant updates without polling.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
