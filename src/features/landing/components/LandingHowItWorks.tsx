import { LANDING_IMAGES } from '../constants'
import { Copy } from 'lucide-react'

export function LandingHowItWorks() {
  return (
    <section id="como-funciona" className="w-full py-16 lg:py-24 bg-white relative overflow-hidden">
      
      {/* Decorative background blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#f9ecef]/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a1c33] mb-4">Así de simple</div>
          <h2 className="font-serif text-4xl md:text-5xl text-zinc-900">Cómo funciona</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-[#7a1c33] text-xs font-bold mb-3">01</div>
            <h3 className="font-bold text-base text-zinc-900 mb-2">Crea tu boutique</h3>
            <p className="text-xs text-zinc-500 mb-8 max-w-[240px]">Regístrate y crea tu boutique en minutos.</p>
            
            {/* Visual */}
            <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-6 text-left transform transition-transform group-hover:-translate-y-2">
              <h4 className="font-serif text-lg mb-1">¡Bienvenida!</h4>
              <p className="font-bold text-xs mb-4 text-zinc-800">Crea tu boutique</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[8px] text-zinc-500 block mb-1">Nombre de tu boutique</label>
                  <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg w-full"></div>
                </div>
                <div>
                  <label className="text-[8px] text-zinc-500 block mb-1">Categoría</label>
                  <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg w-full"></div>
                </div>
                <div className="h-9 bg-[#7a1c33] rounded-lg w-full mt-2 flex items-center justify-center text-white text-[9px] font-bold">Continuar →</div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-[#7a1c33] text-xs font-bold mb-3">02</div>
            <h3 className="font-bold text-base text-zinc-900 mb-2">Personaliza tu catálogo</h3>
            <p className="text-xs text-zinc-500 mb-8 max-w-[240px]">Agrega tus productos, colores, logo y más.</p>
            
            {/* Visual */}
            <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-4 text-left flex transform transition-transform group-hover:-translate-y-2">
              <div className="w-16 border-r border-zinc-100 pr-3 pt-2">
                 <div className="w-8 h-3 bg-zinc-200 rounded mb-4"></div>
                 <div className="space-y-2">
                   <div className="w-10 h-2 bg-zinc-100 rounded"></div>
                   <div className="w-12 h-2 bg-[#7a1c33]/20 rounded"></div>
                   <div className="w-8 h-2 bg-zinc-100 rounded"></div>
                 </div>
              </div>
              <div className="pl-4 flex-1">
                 <div className="font-bold text-[10px] mb-3">Productos</div>
                 <div className="space-y-3">
                   {/* Product row fake */}
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-10 bg-pink-100 rounded overflow-hidden">
                       <img src={LANDING_IMAGES.product1} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <div className="text-[8px] font-bold">Vestido Satín</div>
                       <div className="text-[8px] text-[#7a1c33]">$ 150.00</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-10 bg-zinc-100 rounded overflow-hidden">
                       <img src={LANDING_IMAGES.product2} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <div className="text-[8px] font-bold">Blazer Oversize</div>
                       <div className="text-[8px] text-[#7a1c33]">$ 110.00</div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="text-[#7a1c33] text-xs font-bold mb-3">03</div>
            <h3 className="font-bold text-base text-zinc-900 mb-2">Compártelo con tus clientes</h3>
            <p className="text-xs text-zinc-500 mb-8 max-w-[240px]">Obtén tu enlace y empieza a recibir pedidos.</p>
            
            {/* Visual */}
            <div className="w-full max-w-[280px] flex flex-col gap-3 transform transition-transform group-hover:-translate-y-2">
              <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden text-left h-[180px]">
                 <div className="h-6 border-b border-zinc-100 flex items-center px-3">
                   <span className="font-serif text-[8px] font-bold">LUNA</span>
                 </div>
                 <div className="relative w-full h-full p-4 flex">
                   <div className="w-1/2 pt-2">
                     <h2 className="font-serif text-sm mb-2 leading-tight">Nueva Colección</h2>
                     <div className="w-12 h-4 bg-[#7a1c33] rounded text-[6px] text-white flex items-center justify-center">Ver colección</div>
                   </div>
                   <div className="w-1/2 relative h-24">
                     <div className="absolute inset-0 bg-pink-100 rounded-lg overflow-hidden">
                       <img src={LANDING_IMAGES.hero} className="w-full h-full object-cover object-top" />
                     </div>
                   </div>
                 </div>
              </div>

              {/* URL Bar */}
              <div className="bg-white rounded-xl shadow-md border border-zinc-200 p-2 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 overflow-hidden">
                   <GlobeIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                   <span className="text-[9px] text-zinc-600 truncate">tuboutique.com/mi-tienda</span>
                 </div>
                 <button className="bg-[#7a1c33] text-white text-[8px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                   <Copy className="w-2.5 h-2.5" /> Copiar
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      <path d="M2 12h20"/>
    </svg>
  )
}
