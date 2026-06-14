'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsSection() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'What is ZeroClick?',
            answer: 'ZeroClick is an AI-powered command center that brings your Gmail and Google Calendar into one place. It allows you to execute complex, multi-step workflows with a single natural language command.',
        },
        {
            id: 'item-2',
            question: 'How does it connect to my accounts?',
            answer: 'ZeroClick securely integrates directly with your Google Workspace accounts using standard OAuth. We never store your private emails or calendar events permanently on our servers.',
        },
        {
            id: 'item-3',
            question: 'Do I need to learn specific commands?',
            answer: 'Not at all! ZeroClick is powered by Gemini Flash and understands plain English. Just type what you want to do—like "schedule a 30m sync with Alex tomorrow"—and we handle the rest.',
        },
        {
            id: 'item-4',
            question: 'Can it handle multi-step workflows?',
            answer: "Absolutely. You can chain actions together, such as scheduling a meeting, generating an agenda, inviting the team, and drafting a follow-up email all in one go.",
        },
        {
            id: 'item-5',
            question: 'Is there a free tier available?',
            answer: 'Yes! We offer a Free plan for personal use which includes access to the core command palette and a daily allowance of workflow runs. You can upgrade as your needs grow.',
        },
    ]

    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Everything you need to know about ZeroClick and how it supercharges your productivity.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can't find what you're looking for? Contact our{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            customer support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
