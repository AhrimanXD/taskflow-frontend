import { BENEFITS } from "@/constants/landing"
import { ScrollReveal } from "@/components/features/landing/scroll-reveal"

export function BenefitsSection() {
  return (
    <section id="how-it-works" className="border-t border-border px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <ScrollReveal>
          <p className="font-mono text-xs tracking-wide text-accent-cool uppercase">
            Why teams choose Taskflow
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-instrument)] text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Built for how teams
            <br />
            actually work
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            No project you set up on day one perfectly matches how your team
            works by week three. Taskflow stays out of the way instead of
            forcing a process on you.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delay={index * 0.08}>
              <div className="border-l-2 border-accent-cool/40 pl-5">
                <h3 className="text-base font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
