import { LandingHeader } from './components/LandingHeader'
import { LandingHero } from './components/LandingHero'
import { LandingBenefits } from './components/LandingBenefits'
import { LandingEditorial } from './components/LandingEditorial'
import { LandingHowItWorks } from './components/LandingHowItWorks'
import { LandingBurgundySection } from './components/LandingBurgundySection'
import { LandingWhatsApp } from './components/LandingWhatsApp'
import { LandingFinalCta } from './components/LandingFinalCta'
import { LandingFooter } from './components/LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen font-sans bg-[#fdfbfb] text-zinc-900 selection:bg-[#7a1c33]/20 selection:text-[#7a1c33]">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingBenefits />
        <LandingEditorial />
        <LandingHowItWorks />
        <LandingBurgundySection />
        <LandingWhatsApp />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}
