"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/features/landing/scroll-reveal"
import { useAuth } from "@/lib/auth/auth-provider"

export function CtaSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="border-t border-border px-6 py-24">
      <ScrollReveal className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 rounded-full bg-signal opacity-[0.12] blur-[100px]"
        />
        <h2 className="font-[family-name:var(--font-instrument)] text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Give your team a board that keeps up
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
          Free to start. No credit card, no setup call — just a workspace and a
          task list that stays in sync.
        </p>
        <div className="mt-8 flex justify-center">
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
        </div>
      </ScrollReveal>
    </section>
  )
}
