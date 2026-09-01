import { ArrowRight, Check } from 'lucide-react'
import { LANDING_IMAGES } from '../constants'

export function LandingWhatsApp() {
  return (
    <section className="w-full py-16 lg:py-24 bg-[#fdfbfb] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col items-start relative">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a1c33] mb-4">Más conversiones</div>
            <h2 className="font-serif text-4xl lg:text-5xl text-zinc-900 mb-6 leading-[1.1]">
              Del catálogo a WhatsApp en segundos.
            </h2>
            <p className="text-zinc-600 text-sm mb-10 max-w-sm">
              Tus clientes pueden consultarte, hacer preguntas y realizar pedidos directamente por WhatsApp.
            </p>
            <button className="text-[#7a1c33] font-bold text-sm flex items-center group mb-12 lg:mb-0">
              Saber más <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Woman Image Placeholder */}
            <div className="hidden lg:block absolute -bottom-64 -left-12 w-[350px] h-[500px] rounded-t-full overflow-hidden opacity-90 border-4 border-white shadow-xl">
               <img src={LANDING_IMAGES.benefit1} className="w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* Right Column: Steps */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-stretch justify-center gap-6 relative z-10">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1 w-full max-w-[240px]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#7a1c33] text-white flex items-center justify-center text-[10px] font-bold">1</div>
                <span className="text-[11px] font-bold text-zinc-900">Elige tus productos</span>
              </div>
              
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-zinc-100 w-full">
                <div className="w-full h-40 bg-pink-50 rounded-xl overflow-hidden mb-3">
                  <img src={LANDING_IMAGES.benefit2} className="w-full h-full object-cover object-center" />
                </div>
                <div className="text-[10px] text-zinc-900 font-bold">Vestido Satín Drapeado</div>
                <div className="text-[10px] text-zinc-500 mb-3">$ 150.00</div>
                <div className="w-full h-8 bg-[#7a1c33] text-white rounded-lg flex items-center justify-center text-[9px] font-bold">
                  Agregar al catálogo <ArrowRight className="ml-1 w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Connecting Line (hidden on mobile) */}
            <div className="hidden sm:block h-px w-8 bg-zinc-200 self-center -mx-2 mt-8"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1 w-full max-w-[240px]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#7a1c33] text-white flex items-center justify-center text-[10px] font-bold">2</div>
                <span className="text-[11px] font-bold text-zinc-900">Agrega al carrito</span>
              </div>
              
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-zinc-100 w-full relative">
                <div className="text-[10px] font-bold text-zinc-800 mb-4 pb-2 border-b border-zinc-100">Tu carrito (2)</div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-12 bg-pink-50 rounded-lg overflow-hidden shrink-0">
                    <img src={LANDING_IMAGES.benefit2} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-zinc-800">Vestido Satín Drapeado</div>
                    <div className="text-[9px] text-zinc-500">$ 150.00</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                    <img src={LANDING_IMAGES.product2} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-zinc-800">Blazer Oversize</div>
                    <div className="text-[9px] text-zinc-500">$ 198.00</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold">Total:</span>
                  <span className="text-[10px] font-bold">$ 348.00</span>
                </div>

                <div className="w-full h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[9px] font-bold">
                  Enviar por WhatsApp
                </div>
              </div>
            </div>

            {/* Connecting Line (hidden on mobile) */}
            <div className="hidden sm:block h-px w-8 bg-zinc-200 self-center -mx-2 mt-8"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1 w-full max-w-[240px]">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-[#7a1c33] text-white flex items-center justify-center text-[10px] font-bold">3</div>
                <span className="text-[11px] font-bold text-zinc-900">Envía tu pedido</span>
              </div>
              
              <div className="bg-[#E5DDD5] rounded-2xl shadow-lg w-full h-[260px] overflow-hidden flex flex-col">
                <div className="h-10 bg-[#075E54] flex items-center px-3 gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px]">L</div>
                  <div className="text-white">
                    <div className="text-[10px] font-bold">Boutique LUNA</div>
                    <div className="text-[7px] text-white/70">en línea</div>
                  </div>
                </div>
                
                <div className="p-3 flex-1 flex flex-col gap-2 relative">
                  <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-2 shadow-sm max-w-[90%] self-end">
                    <p className="text-[9px] text-zinc-800 leading-tight">¡Hola! Quiero hacer este pedido 🛍️</p>
                    <div className="bg-white/50 p-2 rounded mt-1 border-l-2 border-emerald-500">
                      <p className="text-[8px] font-bold">Vestido Satín Drapeado</p>
                      <p className="text-[7px] text-zinc-500">$ 150.00</p>
                      <p className="text-[8px] font-bold mt-1">Blazer Oversize</p>
                      <p className="text-[7px] text-zinc-500">$ 198.00</p>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[9px] font-bold">Total: $ 348.00</p>
                      <span className="text-[7px] text-emerald-700 flex gap-0.5">11:30 <Check className="w-2 h-2"/><Check className="w-2 h-2 -ml-1.5"/></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
