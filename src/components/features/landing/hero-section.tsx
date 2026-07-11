"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiveBoardMock } from "@/components/features/landing/live-board-mock"
import { useAuth } from "@/lib/auth/auth-provider"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

export function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-24 sm:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-signal opacity-[0.15] blur-[120px]"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-signal" />
          </span>
          Synced in real time
        </motion.div>

        <motion.h1
          variants={item}
          className="font-[family-name:var(--font-instrument)] text-4xl leading-[1.05] font-medium tracking-tight text-foreground sm:text-6xl"
        >
          Work moves fast.
          <br />
          Your tools should too.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-base text-balance text-muted-foreground sm:text-lg"
        >
          Taskflow keeps every teammate&apos;s board in sync the instant something
          changes — shared workspaces, live updates, zero refresh.
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group bg-signal text-signal-foreground hover:bg-signal/90"
          >
            <Link href={isAuthenticated ? "/tasks" : "/login"}>
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#features">Learn more</a>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-16 max-w-3xl"
      >
        <LiveBoardMock />
      </motion.div>
    </section>
  )
}
