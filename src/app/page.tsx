"use client"

import Link from "next/link"
import { Copy } from "lucide-react"
import { useRef } from "react"

export default function Home() {
  const howItWorksRef = useRef<HTMLElement>(null)

  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault()
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="mx-4 md:mx-8 lg:mx-auto max-w-3xl">

      {/* Hero */}
      <section className="pt-16 pb-14 text-center sm:pt-24 sm:pb-20">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Say what people really think.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-neutral-500 dark:text-neutral-400">
          Get your own link, share it anywhere, and receive honest messages from anyone — without them ever giving their name.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup">
            <button className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-neutral-700 active:bg-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200">
              Create your account
            </button>
          </Link>
          <Link
            href="/login"
            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            Already have an account? Sign in
          </Link>
        </div>

        <a
          href="#how-it-works"
          onClick={scrollToHowItWorks}
          className="mt-6 inline-block text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          See how it works ↓
        </a>

        {/* Concrete mock of the actual product mechanic */}
        <div className="mx-auto mt-12 flex max-w-sm items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.10)] dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex-1 truncate rounded-md bg-neutral-50 px-3 py-2 text-left text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            unfiltered.txt/anonymous/yourname
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white dark:bg-neutral-50 dark:text-neutral-900">
            <Copy className="h-3.5 w-3.5" />
            Copy
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={howItWorksRef} className="border-t border-neutral-200 py-14 dark:border-neutral-800 sm:py-20">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-50">
          How it works
        </h2>

        <ol className="mt-8 space-y-8">
          {[
            {
              title: "Create your account",
              body: "Sign up with just a username, email, and password — takes less than a minute.",
            },
            {
              title: "Land on your dashboard",
              body: "This is where every message sent to you shows up, as soon as it arrives.",
            },
            {
              title: "Copy your link",
              body: "Your dashboard gives you one link that's uniquely yours. One click copies it.",
            },
            {
              title: "Share it anywhere",
              body: "Post it on Instagram, Discord, a bio, wherever. Anyone who opens it can send you a message — they stay anonymous, you don't.",
            },
          ].map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span className="font-serif text-2xl leading-none text-neutral-300 dark:text-neutral-700">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}