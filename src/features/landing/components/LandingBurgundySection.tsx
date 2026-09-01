import { ArrowRight } from 'lucide-react'
import { LANDING_IMAGES } from '../constants'

export function LandingBurgundySection() {
  return (
    <section className="w-full bg-[#5c1325] py-20 lg:py-32 overflow-hidden relative">
      {/* Decorative radial gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#8a223c]/40 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#3a0a16]/60 rounded-full blur-[100px] pointer-events-none translate-y-1/4"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          
          {/* Left Column */}
          <div className="w-full lg:w-4/12 flex flex-col items-start text-left">
            <h2 className="font-serif text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-[1.1]">
              Diseñado para hacer que tu marca se vea <span className="italic text-pink-200">increíble.</span>
            </h2>
            <p className="text-pink-100/80 text-sm md:text-base mb-10 max-w-sm leading-relaxed">
              Catálogos modernos, rápidos y totalmente personalizables. Crea una experiencia digital que refleja la esencia de tu boutique.
            </p>
            <button className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all group">
              Ver todas las características 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Column: Complex Mockup */}
          <div className="w-full lg:w-8/12 relative flex justify-center lg:justify-end min-h-[400px]">
            
            {/* Laptop Mockup */}
            <div className="relative w-[95%] sm:w-[600px] lg:w-[650px] aspect-[16/10] bg-zinc-800 rounded-t-2xl rounded-b-lg shadow-2xl p-2 sm:p-4 border-b-[12px] border-zinc-300 transform -rotate-1 hover:rotate-0 transition-transform duration-700">
              {/* Screen */}
              <div className="w-full h-full bg-[#faf8f6] rounded-lg overflow-hidden border border-zinc-700 relative">
                {/* Header */}
                <div className="h-8 border-b border-zinc-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur">
                  <span className="font-serif text-sm tracking-widest text-zinc-900">AURORA</span>
                  <div className="flex gap-4">
                    <div className="h-1 w-6 bg-zinc-200 rounded-full"></div>
                    <div className="h-1 w-6 bg-zinc-200 rounded-full"></div>
                    <div className="h-1 w-6 bg-zinc-200 rounded-full"></div>
                  </div>
                </div>
                {/* Hero */}
                <div className="w-full h-[60%] bg-[#e3d5ca] flex flex-col items-center justify-center text-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-40">
                     <img src={LANDING_IMAGES.hero} className="w-full h-full object-cover" />
                   </div>
                   <div className="relative z-10 px-4">
                     <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 mb-3">Elegancia en<br/>cada detalle</h2>
                     <div className="w-24 h-6 bg-zinc-900 mx-auto rounded-full text-[6px] text-white flex items-center justify-center uppercase tracking-widest">Ver colección</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Mobile Mockup */}
            <div className="absolute -bottom-8 left-0 sm:left-12 w-[120px] sm:w-[150px] h-[240px] sm:h-[300px] bg-zinc-900 rounded-[2rem] shadow-2xl border-[4px] border-zinc-800 overflow-hidden z-20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="w-full h-full bg-[#faf8f6] pt-5 relative">
                 <div className="text-center font-serif text-[10px] tracking-widest mb-3 text-zinc-900">AURORA</div>
                 <div className="px-3">
                   <h3 className="font-serif text-lg mb-2 leading-tight text-center">Elegancia en<br/>cada detalle</h3>
                   <div className="w-16 h-4 bg-zinc-900 mx-auto rounded-full mb-3"></div>
                   <div className="w-full h-32 bg-[#e3d5ca] rounded-xl overflow-hidden">
                      <img src={LANDING_IMAGES.benefit1} className="w-full h-full object-cover" />
                   </div>
                 </div>
               </div>
            </div>

            {/* Floating Customization Panel */}
            <div className="absolute top-4 sm:top-12 -right-4 sm:-right-8 bg-white rounded-2xl p-4 shadow-2xl border border-zinc-100 z-30 w-[180px] sm:w-[220px]">
               <div className="text-[10px] font-bold mb-4">Personaliza tu catálogo</div>
               
               <div className="mb-4">
                 <label className="text-[8px] text-zinc-500 block mb-2">Colores</label>
                 <div className="flex gap-2">
                   <div className="w-5 h-5 rounded-full bg-zinc-900 ring-1 ring-offset-1 ring-zinc-400"></div>
                   <div className="w-5 h-5 rounded-full bg-[#e3d5ca]"></div>
                   <div className="w-5 h-5 rounded-full bg-[#e87a5d]"></div>
                 </div>
               </div>

               <div className="mb-4">
                 <label className="text-[8px] text-zinc-500 block mb-1">Tipografía</label>
                 <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg w-full flex items-center px-2">
                   <span className="font-serif text-[10px]">Aa Playfair Display</span>
                 </div>
               </div>

               <div className="mb-4">
                 <label className="text-[8px] text-zinc-500 block mb-1">Estilo de botones</label>
                 <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg w-full flex items-center px-2">
                   <span className="text-[9px]">Botones modernos</span>
                 </div>
               </div>

               <div className="w-full h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-[9px] font-bold">
                 Botón principal
               </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
