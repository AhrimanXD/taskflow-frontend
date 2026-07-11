import { TESTIMONIALS } from "@/constants/landing"
import { ScrollReveal } from "@/components/features/landing/scroll-reveal"
import { initials } from "@/lib/utils/format"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs tracking-wide text-signal uppercase">
            Trusted by early teams
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-instrument)] text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Teams notice the moment it syncs
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal key={testimonial.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col justify-between rounded-xl border border-border bg-card p-6">
                <blockquote className="text-sm text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {initials(testimonial.name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
