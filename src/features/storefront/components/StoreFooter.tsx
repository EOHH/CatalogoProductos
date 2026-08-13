import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../providers/StoreProvider'
import { 
  ShoppingBag, 
  LayoutGrid, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Truck, 
  RotateCcw, 
  HelpCircle, 
  Headset, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Award, 
  ChevronDown
} from 'lucide-react'

// Custom SVGs for Socials
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
)

export function StoreFooter() {
  const { tenant, settings } = useStore()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-b from-[#fff5f7] to-[#ffe8ed] border-t border-[#f7d6de] overflow-hidden mt-10 text-[#8a4a58]">
      
      {/* Decorative Floral Backgrounds (Top Corners) */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 opacity-20 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508759077025-a6e54efcb226?q=80&w=600&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'bottom right', borderBottomRightRadius: '100%' }}
      />
      <div 
        className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none mix-blend-multiply"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508759077025-a6e54efcb226?q=80&w=600&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'bottom left', borderBottomLeftRadius: '100%' }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* DESKTOP LAYOUT (Hidden on mobile) */}
        <div className="hidden lg:flex justify-between gap-12">
          
          {/* COLUMN 1: Brand & Newsletter */}
          <div className="w-[380px] flex flex-col">
            <div className="flex flex-col items-center text-center mb-8">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-20 w-auto object-contain mb-4" />
              ) : (
                <div className="mb-4">
                  <h2 className="font-serif text-5xl text-store-primary">Milu</h2>
                  <div className="flex items-center gap-2 text-store-primary text-[10px] tracking-[0.3em]">
                    <div className="h-px w-8 bg-store-primary/50"></div>
                    MODA FEMENINA
                    <div className="h-px w-8 bg-store-primary/50"></div>
                  </div>
                </div>
              )}
              <p className="font-serif italic text-store-primary text-sm mb-4">♥<br/>Tu estilo, tu esencia.</p>
              <p className="text-xs leading-relaxed opacity-80">
                {settings?.description || 'Moda femenina exclusiva para mujeres que inspiran. Colecciones seleccionadas con amor para realzar tu esencia en cada ocasión.'}
              </p>
            </div>

            {/* Newsletter Box */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm text-center mb-6 relative overflow-hidden">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-store-primary mb-2">Únete a nuestra comunidad</h4>
              <p className="text-[11px] opacity-80 mb-4">Recibe novedades, lanzamientos exclusivos y beneficios especiales.</p>
              <div className="space-y-3 relative z-10">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input 
                    type="email" 
                    placeholder="Tu correo electrónico" 
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white bg-white/60 text-sm focus:outline-none focus:ring-1 focus:ring-store-primary/50 placeholder-[#8a4a58]/40"
                  />
                </div>
                <button className="w-full bg-gradient-to-r from-[#d8548f]/90 to-[#d8548f] text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                  SUSCRIBIRME <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="text-center">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-store-primary mb-3">Síguenos en</h4>
              <div className="flex justify-center gap-4">
                {[InstagramIcon, FacebookIcon, TikTokIcon, MessageCircle].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-8 h-8 rounded-full border border-[#f7d6de] flex items-center justify-center text-store-primary hover:bg-store-primary hover:text-white transition-colors bg-white/40 backdrop-blur-md">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-[#f7d6de] to-transparent"></div>

          {/* COLUMN 2: Navigation & Contact */}
          <div className="flex-1 flex flex-col justify-between pl-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-5 h-5 opacity-50 text-store-primary" strokeWidth={1.5} />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-store-primary">Navegación</h4>
              </div>
              <ul className="space-y-6">
                <li><Link to="/catalog" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><ShoppingBag className="w-4 h-4 opacity-40"/> Catálogo Completo</Link></li>
                <li><Link to="/categories" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><LayoutGrid className="w-4 h-4 opacity-40"/> Categorías</Link></li>
                <li><Link to="/collections" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><Heart className="w-4 h-4 opacity-40"/> Colecciones</Link></li>
                <li><Link to="/catalog" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><Sparkles className="w-4 h-4 opacity-40"/> Novedades</Link></li>
              </ul>
            </div>

            {/* Need Help Box */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm mt-12 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-store-primary/10 flex items-center justify-center text-store-primary">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-store-primary">¿Necesitas Ayuda?</h4>
                  <p className="text-[11px] opacity-80">Estamos aquí para ti.</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs relative z-10">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 opacity-50"/> +51 975 991 831</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 opacity-50"/> hola@{settings?.store_name?.toLowerCase() || tenant?.name.toLowerCase()}.com</li>
                <li className="flex items-center gap-3"><Clock className="w-4 h-4 opacity-50"/> Lun - Vie: 9:00 a.m. - 6:00 p.m.</li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: Support & Trust Badges */}
          <div className="flex-1 flex flex-col justify-between pl-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-5 h-5 opacity-50 text-store-primary" strokeWidth={1.5} />
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-store-primary">Soporte</h4>
              </div>
              <ul className="space-y-6">
                <li><a href="https://wa.me/51975991831" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><MessageCircle className="w-4 h-4 opacity-40"/> Contacto WhatsApp</a></li>
                <li><a href="#" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><Truck className="w-4 h-4 opacity-40"/> Políticas de Envío</a></li>
                <li><a href="#" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><RotateCcw className="w-4 h-4 opacity-40"/> Devoluciones</a></li>
                <li><a href="#" className="flex items-center gap-3 text-sm hover:text-store-primary transition-colors"><HelpCircle className="w-4 h-4 opacity-40"/> Preguntas Frecuentes</a></li>
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm mt-12 grid grid-cols-3 gap-2 relative overflow-hidden">
              <div className="text-center relative z-10">
                <ShieldCheck className="w-6 h-6 text-store-primary mx-auto mb-2" strokeWidth={1.5} />
                <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Compra Segura</h5>
                <p className="text-[9px] opacity-70 leading-tight">Tus datos protegidos</p>
              </div>
              <div className="text-center relative z-10">
                <Award className="w-6 h-6 text-store-primary mx-auto mb-2" strokeWidth={1.5} />
                <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Calidad Premium</h5>
                <p className="text-[9px] opacity-70 leading-tight">Seleccionamos lo mejor</p>
              </div>
              <div className="text-center relative z-10">
                <Heart className="w-6 h-6 text-store-primary mx-auto mb-2" strokeWidth={1.5} />
                <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Con Amor</h5>
                <p className="text-[9px] opacity-70 leading-tight">Cada detalle importa</p>
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE LAYOUT (Hidden on desktop) */}
        <div className="lg:hidden flex flex-col items-center px-2">
          
          {/* Logo & Description */}
          <div className="flex flex-col items-center text-center mb-10">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-16 w-auto object-contain mb-3" />
            ) : (
              <div className="mb-4 mt-4">
                <h2 className="font-serif text-5xl text-store-primary">Milu</h2>
                <div className="flex items-center gap-2 text-store-primary text-[9px] tracking-[0.3em]">
                  <div className="h-px w-6 bg-store-primary/50"></div>
                  MODA FEMENINA
                  <div className="h-px w-6 bg-store-primary/50"></div>
                </div>
              </div>
            )}
            <p className="font-serif italic text-store-primary text-sm mb-4">♥<br/>Tu estilo, tu esencia.</p>
            <p className="text-xs leading-relaxed opacity-80 px-2">
              {settings?.description || 'Moda femenina exclusiva para mujeres que inspiran. Colecciones seleccionadas con amor para realzar tu esencia en cada ocasión.'}
            </p>
          </div>

          {/* Newsletter Box */}
          <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-sm text-center mb-8 relative overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-store-primary mb-2">Únete a nuestra comunidad</h4>
            <p className="text-[11px] opacity-80 mb-4">Recibe novedades, lanzamientos exclusivos y beneficios especiales.</p>
            <div className="space-y-3 relative z-10">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-white bg-white/60 text-sm focus:outline-none focus:ring-1 focus:ring-store-primary/50 placeholder-[#8a4a58]/40"
                />
              </div>
              <button className="w-full bg-gradient-to-r from-[#d8548f]/90 to-[#d8548f] text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                SUSCRIBIRME <Heart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Socials */}
          <div className="text-center mb-10 w-full border-b border-[#f7d6de] pb-10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-store-primary mb-4">Síguenos en</h4>
            <div className="flex justify-center gap-4">
              {[InstagramIcon, FacebookIcon, TikTokIcon, MessageCircle].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full border border-[#f7d6de] flex items-center justify-center text-store-primary hover:bg-store-primary hover:text-white transition-colors bg-white/40 backdrop-blur-md shadow-sm">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="w-full space-y-0 mb-10">
            {/* Nav Accordion */}
            <div className="border-b border-[#f7d6de]/60">
              <button 
                onClick={() => toggleSection('nav')}
                className="w-full flex justify-between items-center py-5 text-[11px] font-bold uppercase tracking-widest text-store-primary"
              >
                <div className="flex items-center gap-3"><ShoppingBag className="w-4 h-4 opacity-60"/> Navegación</div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'nav' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'nav' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 pl-7 text-sm opacity-90">
                  <li><Link to="/catalog">Catálogo Completo</Link></li>
                  <li><Link to="/categories">Categorías</Link></li>
                  <li><Link to="/collections">Colecciones</Link></li>
                  <li><Link to="/catalog">Novedades</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Support Accordion */}
            <div className="border-b border-[#f7d6de]/60">
              <button 
                onClick={() => toggleSection('support')}
                className="w-full flex justify-between items-center py-5 text-[11px] font-bold uppercase tracking-widest text-store-primary"
              >
                <div className="flex items-center gap-3"><Heart className="w-4 h-4 opacity-60"/> Soporte</div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'support' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'support' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 pl-7 text-sm opacity-90">
                  <li><a href="https://wa.me/51975991831">Contacto WhatsApp</a></li>
                  <li><a href="#">Políticas de Envío</a></li>
                  <li><a href="#">Devoluciones</a></li>
                  <li><a href="#">Preguntas Frecuentes</a></li>
                </ul>
              </div>
            </div>

            {/* Help Accordion */}
            <div className="border-b border-[#f7d6de]/60">
              <button 
                onClick={() => toggleSection('help')}
                className="w-full flex justify-between items-center py-5 text-[11px] font-bold uppercase tracking-widest text-store-primary"
              >
                <div className="flex items-center gap-3"><Headset className="w-4 h-4 opacity-60"/> ¿Necesitas Ayuda?</div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSection === 'help' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'help' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 pl-7 text-sm opacity-90">
                  <li className="flex items-center gap-3"><Phone className="w-4 h-4 opacity-60"/> +51 975 991 831</li>
                  <li className="flex items-center gap-3"><Mail className="w-4 h-4 opacity-60"/> hola@{settings?.store_name?.toLowerCase() || tenant?.name.toLowerCase()}.com</li>
                  <li className="flex items-center gap-3"><Clock className="w-4 h-4 opacity-60"/> Lun - Vie: 9:00 a.m. - 6:00 p.m.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="w-full grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-store-primary" strokeWidth={1.5} />
              </div>
              <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Compra Segura</h5>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Award className="w-5 h-5 text-store-primary" strokeWidth={1.5} />
              </div>
              <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Calidad Premium</h5>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Heart className="w-5 h-5 text-store-primary" strokeWidth={1.5} />
              </div>
              <h5 className="text-[8px] font-bold uppercase tracking-widest text-store-primary mb-1">Con Amor</h5>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR (Desktop & Mobile) */}
        <div className="mt-16 pt-8 border-t border-[#f7d6de] flex flex-col md:flex-row justify-between items-center relative">
          
          {/* Center Logo 'M' */}
          <div className="absolute left-1/2 -top-5 -translate-x-1/2 bg-[#fff2f5] px-4 hidden md:flex items-center gap-2 text-store-primary">
            <Sparkles className="w-3 h-3 opacity-50"/>
            <span className="font-serif text-3xl">M</span>
            <Sparkles className="w-3 h-3 opacity-50"/>
          </div>

          <div className="absolute left-1/2 -top-4 -translate-x-1/2 bg-[#fff2f5] px-3 md:hidden flex items-center gap-1 text-store-primary">
            <Sparkles className="w-2.5 h-2.5 opacity-50"/>
            <span className="font-serif text-2xl">M</span>
            <Sparkles className="w-2.5 h-2.5 opacity-50"/>
          </div>

          <p className="text-[10px] opacity-60 mt-4 md:mt-0 text-center md:text-left">
            © {currentYear} {settings?.store_name || tenant?.name}. Todos los derechos reservados.
          </p>
          <p className="text-[10px] opacity-60 mt-2 md:mt-0 text-center md:text-right">
            Powered by <span className="font-bold text-store-primary">Catálogo Premium</span>
          </p>
        </div>

      </div>
    </footer>
  )
}
