import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../providers/StoreProvider'
import { getWhatsAppUrl } from '@/utils/whatsapp'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { 
  Phone, Mail, Clock, MapPin, ChevronRight, 
  HelpCircle, Package, CreditCard, ShieldCheck, FileText, Plus 
} from 'lucide-react'

// Custom SVGs for Socials
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
)

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
)

export function StoreFooter() {
  const { tenant, settings } = useStore()
  const { buildUrl } = useStoreRoute()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const formatSocialUrl = (usernameOrUrl?: string | null, platform?: 'instagram' | 'facebook' | 'tiktok') => {
    if (!usernameOrUrl) return '#'
    if (usernameOrUrl.startsWith('http')) return usernameOrUrl
    const cleanUsername = usernameOrUrl.replace('@', '')
    switch (platform) {
      case 'instagram': return `https://instagram.com/${cleanUsername}`
      case 'facebook': return `https://facebook.com/${cleanUsername}`
      case 'tiktok': return `https://tiktok.com/@${cleanUsername}`
      default: return `https://${cleanUsername}`
    }
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const currentYear = new Date().getFullYear()
  const waUrl = getWhatsAppUrl(settings?.phone)

  return (
    <footer id="footer" className="bg-[#111111] text-zinc-300 mt-20 relative">
      {/* Top Border with Center Notch */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-store-primary w-full"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-store-primary"></div>
      
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-8">
        
        {/* DESKTOP LAYOUT (Hidden on mobile) */}
        <div className="hidden lg:grid grid-cols-12 gap-8 lg:gap-12 border-b border-zinc-800 pb-16">
          
          {/* COLUMN 1: Brand & Socials (3 cols) */}
          <div className="col-span-4 flex flex-col items-center border-r border-zinc-800 pr-8">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-24 w-auto object-contain mb-6 brightness-0 invert opacity-90" />
            ) : (
              <h2 className="font-serif text-3xl text-store-primary tracking-tight mb-6 text-center">
                {settings?.store_name || tenant?.name}
              </h2>
            )}
            <p className="text-[11px] leading-relaxed max-w-[200px] mb-8 text-center text-zinc-400">
              {settings?.description || 'Tu estilo, tu esencia. Piezas únicas que te acompañan en cada momento.'}
            </p>
            <div className="flex gap-4">
              <a href={formatSocialUrl(settings?.social_instagram, 'instagram')} target={settings?.social_instagram ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_instagram ? 'border-zinc-700 hover:border-store-primary hover:text-store-primary text-zinc-400' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'} flex items-center justify-center transition-colors`}>
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href={formatSocialUrl(settings?.social_facebook, 'facebook')} target={settings?.social_facebook ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_facebook ? 'border-zinc-700 hover:border-store-primary hover:text-store-primary text-zinc-400' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'} flex items-center justify-center transition-colors`}>
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href={formatSocialUrl(settings?.social_tiktok, 'tiktok')} target={settings?.social_tiktok ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_tiktok ? 'border-zinc-700 hover:border-store-primary hover:text-store-primary text-zinc-400' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'} flex items-center justify-center transition-colors`}>
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a href={waUrl || '#'} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${waUrl ? 'border-zinc-700 hover:border-store-primary hover:text-store-primary text-zinc-400' : 'border-zinc-800 text-zinc-600 cursor-not-allowed'} flex items-center justify-center transition-colors`}>
                <WhatsappIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: Explorar (3 cols) */}
          <div className="col-span-3 flex flex-col pl-4">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-6 flex flex-col gap-2">
              Explorar
              <span className="w-6 h-px bg-store-primary"></span>
            </h4>
            <ul className="space-y-4 text-[11px] text-zinc-400">
              <li>
                <Link to={buildUrl("/catalog")} className="flex items-center justify-between hover:text-white transition-colors group">
                  Catálogo Completo <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-store-primary" />
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/catalog")} className="flex items-center justify-between hover:text-white transition-colors group">
                  Categorías <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-store-primary" />
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/catalog")} className="flex items-center justify-between hover:text-white transition-colors group">
                  Colecciones <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-store-primary" />
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/catalog")} className="flex items-center justify-between hover:text-white transition-colors group">
                  Novedades <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-store-primary" />
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/catalog")} className="flex items-center justify-between hover:text-white transition-colors group">
                  Ofertas Exclusivas <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-store-primary" />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Ayuda (2 cols) */}
          <div className="col-span-2 flex flex-col">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-6 flex flex-col gap-2">
              Ayuda
              <span className="w-6 h-px bg-store-primary"></span>
            </h4>
            <ul className="space-y-4 text-[11px] text-zinc-400">
              <li>
                <Link to={buildUrl("/info/faq")} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <HelpCircle className="w-4 h-4 text-zinc-500 group-hover:text-store-primary" strokeWidth={1.5} /> Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/info/shipping")} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Package className="w-4 h-4 text-zinc-500 group-hover:text-store-primary" strokeWidth={1.5} /> Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/info/payment")} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <CreditCard className="w-4 h-4 text-zinc-500 group-hover:text-store-primary" strokeWidth={1.5} /> Métodos de Pago
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/info/privacy")} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-store-primary" strokeWidth={1.5} /> Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to={buildUrl("/info/terms")} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <FileText className="w-4 h-4 text-zinc-500 group-hover:text-store-primary" strokeWidth={1.5} /> Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Contacto (3 cols) */}
          <div className="col-span-3 flex flex-col pl-4">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-6 flex flex-col gap-2">
              Contacto
              <span className="w-6 h-px bg-store-primary"></span>
            </h4>
            <ul className="space-y-4 text-[11px] text-zinc-400">
              {settings?.phone && (
                <li>
                  <a href={waUrl || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors group">
                    <Phone className="w-4 h-4 text-store-primary/80 group-hover:text-store-primary" strokeWidth={1.5} /> {settings.phone}
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${settings?.contact_email || 'hola@tienda.com'}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-store-primary/80 group-hover:text-store-primary" strokeWidth={1.5} /> {settings?.contact_email || 'hola@tienda.com'}
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-store-primary/80" strokeWidth={1.5} /> {settings?.address || 'A todo el país'}
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-store-primary/80 mt-0.5" strokeWidth={1.5} /> 
                  <span>Lun - Vie: 9am - 6pm<br/>Sáb: 9am - 1pm</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* MOBILE LAYOUT (Hidden on desktop) */}
        <div className="lg:hidden flex flex-col items-center">
          
          {/* Logo & Description */}
          <div className="flex flex-col items-center mb-10 w-full border-b border-zinc-800 pb-10">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-20 w-auto object-contain mb-6 brightness-0 invert opacity-90" />
            ) : (
              <h2 className="font-serif text-3xl text-store-primary tracking-tight mb-6 text-center">
                {settings?.store_name || tenant?.name}
              </h2>
            )}
            <p className="text-[11px] leading-relaxed max-w-[200px] mb-8 text-center text-zinc-400">
              {settings?.description || 'Tu estilo, tu esencia. Piezas únicas que te acompañan en cada momento.'}
            </p>
            <div className="flex gap-4">
              <a href={formatSocialUrl(settings?.social_instagram, 'instagram')} target={settings?.social_instagram ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_instagram ? 'border-zinc-700 text-zinc-400' : 'border-zinc-800 text-zinc-600'} flex items-center justify-center`}>
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href={formatSocialUrl(settings?.social_facebook, 'facebook')} target={settings?.social_facebook ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_facebook ? 'border-zinc-700 text-zinc-400' : 'border-zinc-800 text-zinc-600'} flex items-center justify-center`}>
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a href={formatSocialUrl(settings?.social_tiktok, 'tiktok')} target={settings?.social_tiktok ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${settings?.social_tiktok ? 'border-zinc-700 text-zinc-400' : 'border-zinc-800 text-zinc-600'} flex items-center justify-center`}>
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a href={waUrl || '#'} target={waUrl ? "_blank" : undefined} rel="noopener noreferrer" className={`w-10 h-10 rounded-full border ${waUrl ? 'border-zinc-700 text-zinc-400' : 'border-zinc-800 text-zinc-600'} flex items-center justify-center`}>
                <WhatsappIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Accordions */}
          <div className="w-full space-y-0 border-b border-zinc-800 pb-6 mb-8">
            
            {/* Explorar */}
            <div className="border-b border-zinc-800/50">
              <button onClick={() => toggleSection('explorar')} className="w-full flex justify-between items-center py-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Explorar</span>
                <Plus className={`w-4 h-4 text-store-primary transition-transform duration-300 ${openSection === 'explorar' ? 'rotate-45' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'explorar' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 text-[11px] text-zinc-400">
                  <li><Link to={buildUrl("/catalog")}>Catálogo Completo</Link></li>
                  <li><Link to={buildUrl("/catalog")}>Categorías</Link></li>
                  <li><Link to={buildUrl("/catalog")}>Colecciones</Link></li>
                  <li><Link to={buildUrl("/catalog")}>Ofertas Exclusivas</Link></li>
                </ul>
              </div>
            </div>

            {/* Ayuda */}
            <div className="border-b border-zinc-800/50">
              <button onClick={() => toggleSection('ayuda')} className="w-full flex justify-between items-center py-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Ayuda</span>
                <Plus className={`w-4 h-4 text-store-primary transition-transform duration-300 ${openSection === 'ayuda' ? 'rotate-45' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'ayuda' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 text-[11px] text-zinc-400">
                  <li><Link to={buildUrl("/info/faq")}>Preguntas Frecuentes</Link></li>
                  <li><Link to={buildUrl("/info/shipping")}>Envíos y Devoluciones</Link></li>
                  <li><Link to={buildUrl("/info/payment")}>Métodos de Pago</Link></li>
                  <li><Link to={buildUrl("/info/privacy")}>Política de Privacidad</Link></li>
                  <li><Link to={buildUrl("/info/terms")}>Términos y Condiciones</Link></li>
                </ul>
              </div>
            </div>

            {/* Contacto */}
            <div className="border-b border-zinc-800/50">
              <button onClick={() => toggleSection('contacto')} className="w-full flex justify-between items-center py-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Contacto</span>
                <Plus className={`w-4 h-4 text-store-primary transition-transform duration-300 ${openSection === 'contacto' ? 'rotate-45' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === 'contacto' ? 'max-h-60 pb-5' : 'max-h-0'}`}>
                <ul className="space-y-4 text-[11px] text-zinc-400">
                  {settings?.phone && <li>{settings.phone}</li>}
                  <li>{settings?.contact_email || 'hola@tienda.com'}</li>
                  <li>{settings?.address || 'A todo el país'}</li>
                  <li>Lun - Vie: 9am - 6pm</li>
                </ul>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-widest text-zinc-500 pt-6">
          <p className="mb-4 md:mb-0 text-center md:text-left">
            © {currentYear} {settings?.store_name || tenant?.name}. Todos los derechos reservados.
          </p>
          <p className="text-center md:text-right">
            POWERED BY <span className="font-bold text-store-primary">CATÁLOGO PREMIUM</span>
          </p>
        </div>

      </div>
    </footer>
  )
}
