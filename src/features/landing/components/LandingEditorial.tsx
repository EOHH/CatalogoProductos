import { LANDING_IMAGES } from '../constants'
import { Check } from 'lucide-react'

export function LandingEditorial() {
  return (
    <section className="w-full py-16 lg:py-24 bg-[#fdfbfb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Title + 03) */}
          <div className="lg:col-span-4 flex flex-col gap-16">
            <div className="pt-8">
              <h2 className="font-serif text-4xl lg:text-5xl leading-tight text-zinc-900 mb-6">
                Tu marca.<br/>Tu catálogo.<br/>Tu estilo.
              </h2>
              {/* Decorative line */}
              <div className="w-24 h-px bg-[#7a1c33]/30 relative flex items-center justify-center mt-8">
                <span className="text-[#7a1c33]/40 absolute">✽</span>
              </div>
            </div>

            {/* Block 03 */}
            <div className="bg-[#f9ecef]/30 p-8 rounded-3xl border border-[#7a1c33]/10 relative overflow-hidden">
               <div className="text-[#7a1c33] text-sm font-bold mb-2">03</div>
               <h3 className="font-serif text-xl mb-3 text-zinc-900">Una identidad<br/>realmente tuya</h3>
               <p className="text-xs text-zinc-500 mb-6">Personaliza logo, favicon, colores y apariencia.</p>
               
               {/* Mockup */}
               <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-4 pb-0 mt-4 h-32 relative">
                  <div className="text-[10px] font-bold text-zinc-800 mb-2">Personaliza tu catálogo</div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                      <span className="text-[9px] text-zinc-500">Logo</span>
                      <span className="font-serif text-xs text-[#7a1c33]">GOTTI</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                      <span className="text-[9px] text-zinc-500">Color principal</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#7a1c33]"></div>
                        <span className="text-[9px] font-mono">#7a1c33</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Columns (01, 02, 04) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Block 01 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center text-center">
              <div className="text-[#7a1c33] text-sm font-bold mb-2 self-start text-left w-full">01</div>
              <h3 className="font-serif text-xl mb-3 text-zinc-900 self-start text-left w-full">Catálogo<br/>profesional</h3>
              <p className="text-xs text-zinc-500 self-start text-left w-full mb-6">Publica productos, colecciones, variantes, precios e imágenes.</p>
              
              {/* Product Mockup */}
              <div className="w-[85%] rounded-2xl overflow-hidden shadow-lg border border-zinc-100 bg-white pb-4 mt-auto">
                <div className="h-32 bg-pink-50 relative">
                  <img src={LANDING_IMAGES.benefit2} className="w-full h-full object-cover" alt="Vestido Satin" />
                </div>
                <div className="px-4 pt-3 text-left">
                  <p className="font-bold text-[10px] text-zinc-900">$ 105.00</p>
                  <p className="text-[9px] text-zinc-600 mb-1">Vestido Satín Drapeado</p>
                  <div className="flex gap-1 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-100"></div>
                  </div>
                  <div className="w-full h-6 rounded-md bg-[#7a1c33] text-white text-[8px] font-bold flex items-center justify-center">Agregar al catálogo</div>
                </div>
              </div>
            </div>

            {/* Block 02 */}
            <div className="bg-[#fcf9f9] p-8 rounded-3xl border border-zinc-100">
              <div className="text-[#7a1c33] text-sm font-bold mb-2">02</div>
              <h3 className="font-serif text-xl mb-3 text-zinc-900">Pedidos por<br/>WhatsApp</h3>
              <p className="text-xs text-zinc-500 mb-6">Convierte visitantes en clientes con procesos simplificados.</p>

              {/* WhatsApp Mockup */}
              <div className="bg-[#E5DDD5] rounded-2xl p-4 shadow-inner mt-8 relative">
                 <div className="bg-white rounded-xl rounded-tr-none p-3 shadow-sm max-w-[85%] ml-auto mb-2 relative">
                   <p className="text-[10px] text-zinc-800">¡Hola! Quiero hacer un pedido 🛍️</p>
                   <span className="text-[7px] text-zinc-400 absolute bottom-1 right-2">11:30</span>
                 </div>
                 <div className="bg-[#DCF8C6] rounded-xl rounded-tl-none p-3 shadow-sm max-w-[85%] mr-auto relative">
                   <p className="text-[10px] text-zinc-800">¡Hola! Claro que sí. ¿En qué color buscas el vestido?</p>
                   <span className="text-[7px] text-green-700 absolute bottom-1 right-2 flex gap-0.5">11:31 <Check className="w-2 h-2"/><Check className="w-2 h-2 -ml-1.5"/></span>
                 </div>
              </div>
            </div>

            {/* Block 04 (Full width spanning 2 cols below 01 & 02) */}
            <div className="md:col-span-2 bg-[#fdfbfb] p-8 rounded-3xl border border-zinc-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="md:w-1/3">
                <div className="text-[#7a1c33] text-sm font-bold mb-2">04</div>
                <h3 className="font-serif text-xl mb-3 text-zinc-900">Tu propio espacio<br/>digital</h3>
                <p className="text-xs text-zinc-500">Cada boutique obtiene su propia URL y posteriormente podrá conectar su propio dominio.</p>
              </div>

              <div className="md:w-2/3 bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="text-[10px] text-zinc-500">URL Propia</div>
                <div className="bg-zinc-50 rounded-xl px-4 py-2 flex items-center gap-2 border border-zinc-200">
                  <span className="text-[10px] text-zinc-400">gotticatalogs.com/</span>
                  <span className="text-[11px] font-bold text-zinc-800">mi-tienda</span>
                </div>
                
                <div className="text-[10px] text-zinc-500 mt-2">Conecta tu dominio (Próximamente)</div>
                <div className="bg-zinc-50 rounded-xl px-4 py-2 flex items-center justify-between border border-zinc-200 opacity-60">
                  <span className="text-[11px] text-zinc-800">www.miboutique.com</span>
                  <Check className="w-3 h-3 text-[#7a1c33]" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
