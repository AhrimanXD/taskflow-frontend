import { Instrument_Sans } from "next/font/google"

import { LandingNavbar } from "@/components/features/landing/landing-navbar"
import { HeroSection } from "@/components/features/landing/hero-section"
import { FeaturesSection } from "@/components/features/landing/features-section"
import { BenefitsSection } from "@/components/features/landing/benefits-section"
import { TestimonialsSection } from "@/components/features/landing/testimonials-section"
import { CtaSection } from "@/components/features/landing/cta-section"
import { LandingFooter } from "@/components/features/landing/landing-footer"

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["500", "600"],
})

export default function Home() {
  return (
    <div className={`${instrumentSans.variable} flex min-h-screen flex-col bg-background`}>
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
