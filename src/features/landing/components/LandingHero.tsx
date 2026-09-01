import { Link } from 'react-router-dom'
import { BRAND, LANDING_IMAGES } from '../constants'
import { ArrowRight, Play, CheckCircle2, MessageCircle, ShoppingBag, Palette, Globe } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative w-full pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Background soft gradient */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#f9ecef]/50 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Left Column: Copy */}
          <div className="w-full lg:w-5/12 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-8">
              Plataforma #1 para boutiques
            </div>
            
            <h1 className="font-serif text-5xl lg:text-6xl xl:text-[70px] leading-[1.1] text-zinc-900 mb-6 tracking-tight">
              Tu boutique merece algo <span className="text-[#7a1c33] italic">más</span> que un catálogo.
            </h1>
            
            <p className="text-base lg:text-lg text-zinc-600 mb-10 leading-relaxed max-w-xl">
              {BRAND.description}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link 
                to="/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#7a1c33] text-white text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-[#7a1c33]/90 transition-all shadow-md hover:shadow-lg group"
              >
                Crear mi catálogo 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="w-full sm:w-auto inline-flex items-center justify-center bg-white border border-zinc-200 text-zinc-700 text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-zinc-50 transition-all shadow-sm">
                <div className="w-6 h-6 rounded-full border border-zinc-300 flex items-center justify-center mr-3">
                  <Play className="w-2.5 h-2.5 ml-0.5 text-zinc-500" fill="currentColor" />
                </div>
                Ver cómo funciona
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sin conocimientos técnicos · Configura tu tienda en minutos</span>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="w-full lg:w-7/12 relative flex justify-center lg:justify-end">
            
            {/* The Laptop Mockup Base */}
            <div className="relative w-[90%] md:w-[700px] h-auto aspect-[16/10] bg-zinc-800 rounded-t-3xl rounded-b-xl shadow-2xl p-3 sm:p-5 border-b-[16px] border-zinc-300">
              {/* Screen Content */}
              <div className="w-full h-full bg-[#fcf9f9] rounded-xl overflow-hidden relative border border-zinc-700">
                
                {/* Fake Header */}
                <div className="h-10 border-b border-zinc-200 flex items-center justify-between px-6">
                  <span className="font-serif text-lg tracking-widest text-zinc-800">LUNA</span>
                  <div className="flex gap-4">
                    <div className="h-1 w-8 bg-zinc-200 rounded-full"></div>
                    <div className="h-1 w-8 bg-zinc-200 rounded-full"></div>
                    <div className="h-1 w-8 bg-zinc-200 rounded-full"></div>
                  </div>
                </div>

                {/* Fake Hero inside laptop */}
                <div className="relative w-full h-full p-8 flex">
                   <div className="w-1/2 pt-8">
                     <h2 className="font-serif text-3xl mb-4">Nueva Colección<br/>Primavera Verano<br/>2024</h2>
                     <div className="w-24 h-8 bg-[#7a1c33] rounded-full"></div>
                   </div>
                   <div className="w-1/2 relative">
                     <div className="absolute inset-0 bg-pink-100/50 rounded-2xl overflow-hidden">
                       <img src={LANDING_IMAGES.hero} alt="Fashion Cover" className="w-full h-full object-cover object-top" />
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="absolute -bottom-10 -right-4 sm:right-10 w-[140px] sm:w-[180px] h-[280px] sm:h-[380px] bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-[6px] border-zinc-900 overflow-hidden z-20">
               {/* Mobile Notch */}
               <div className="absolute top-0 inset-x-0 h-4 bg-zinc-900 rounded-b-xl w-1/2 mx-auto z-30"></div>
               {/* Mobile Screen */}
               <div className="w-full h-full bg-[#fcf9f9] pt-6 relative">
                 <div className="text-center font-serif text-sm tracking-widest mb-4">LUNA</div>
                 <div className="px-3">
                   <h3 className="font-serif text-xl mb-3 leading-tight">Nueva<br/>Colección</h3>
                   <div className="w-full h-40 bg-pink-50 rounded-xl overflow-hidden">
                     <img src={LANDING_IMAGES.benefit1} alt="Mobile Cover" className="w-full h-full object-cover object-top" />
                   </div>
                 </div>
               </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-4 sm:top-12 left-0 sm:-left-12 bg-white rounded-2xl p-3 pr-4 shadow-xl border border-zinc-100 flex items-center gap-3 z-30 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold">Nuevo pedido</p>
                <p className="text-[9px] text-zinc-500">por WhatsApp</p>
              </div>
            </div>

            <div className="absolute bottom-20 sm:bottom-32 left-4 sm:-left-8 bg-white rounded-2xl p-3 pr-4 shadow-xl border border-zinc-100 flex items-center gap-3 z-30">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold">Catálogo</p>
                <p className="text-[9px] text-zinc-500">publicado</p>
              </div>
            </div>

            <div className="absolute top-32 right-[-20px] sm:right-[-40px] bg-white rounded-xl py-2 px-3 shadow-lg border border-zinc-100 flex items-center gap-2 z-30">
              <ShoppingBag className="w-3.5 h-3.5 text-[#7a1c33]" />
              <span className="text-[10px] font-bold">+12 productos</span>
            </div>

            <div className="absolute top-52 right-[-20px] sm:right-[-40px] bg-white rounded-xl py-2 px-3 shadow-lg border border-zinc-100 flex items-center gap-2 z-30">
              <Palette className="w-3.5 h-3.5 text-[#7a1c33]" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-bold leading-tight">Tu marca,</span>
                 <span className="text-[9px] font-bold leading-tight">tus colores</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
