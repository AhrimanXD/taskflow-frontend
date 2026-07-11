import { FEATURES } from "@/constants/landing"
import { ScrollReveal } from "@/components/features/landing/scroll-reveal"

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs tracking-wide text-signal uppercase">
            Features
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-instrument)] text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Everything a team needs, nothing it doesn&apos;t
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.06}>
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-signal/40">
                <div className="flex size-10 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
