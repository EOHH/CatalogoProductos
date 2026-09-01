import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function LandingFinalCta() {
  return (
    <section className="w-full py-24 lg:py-32 bg-[#f9ecef]/40 relative overflow-hidden">
      {/* Decorative floral/leaf element hint */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://images.unsplash.com/photo-1605369684347-16785024ca70?q=80&w=400&auto=format&fit=crop')] bg-cover opacity-5 rounded-bl-full pointer-events-none"></div>
      
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-900 mb-8 leading-[1.1]">
          Tu próxima vitrina ya no necesita estar en una calle.<br/>
          <span className="italic text-[#7a1c33]">Puede estar en todas partes.</span>
        </h2>
        
        <p className="text-zinc-600 mb-12 max-w-xl mx-auto">
          Únete a las boutiques que ya están transformando su forma de vender con GOTTI Catalogs.
        </p>
        
        <Link 
          to="/register" 
          className="inline-flex items-center justify-center bg-[#7a1c33] text-white text-sm font-bold uppercase tracking-widest px-10 py-5 rounded-full hover:bg-[#7a1c33]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
        >
          Crear mi catálogo
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
