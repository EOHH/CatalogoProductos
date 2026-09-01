import { ShoppingBag, MessageCircle, Palette, Smartphone, Link2 } from 'lucide-react'

export function LandingBenefits() {
  const benefits = [
    { icon: ShoppingBag, label: "Catálogo online" },
    { icon: MessageCircle, label: "Pedidos por WhatsApp" },
    { icon: Palette, label: "Personalización" },
    { icon: Smartphone, label: "Responsive" },
    { icon: Link2, label: "URL propia" }
  ]

  return (
    <section id="caracteristicas" className="w-full py-16 bg-[#fdfbfb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-zinc-900 mb-12">
          Todo lo que necesitas para llevar tu boutique al mundo digital.
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 justify-items-center">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon
            return (
              <div key={idx} className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-[#7a1c33]/20 flex items-center justify-center text-[#7a1c33] bg-[#f9ecef]/30">
                  <Icon strokeWidth={1.5} className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-zinc-800 tracking-wide">{benefit.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
