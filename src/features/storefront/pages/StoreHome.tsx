import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Loader2, ArrowRight, ShieldCheck, Award } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { ProductCard } from '../components/ProductCard'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { PremiumCarousel } from '../components/PremiumCarousel'
import { CategoryBanners } from '../components/CategoryBanners'

export function StoreHome() {
  const { tenant, settings } = useStore()
  const { buildUrl } = useStoreRoute()

  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ['public-new-products', tenant?.id],
    queryFn: () => catalogService.getNewProducts(tenant!.id),
    enabled: !!tenant?.id
  })

  const processedProducts = newProducts ? [...newProducts] : []

  return (
    <div className="w-full fade-in font-sans bg-[#fcf9f9] pb-0">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* 1. HERO BANNER */}
        <section className="relative w-full rounded-3xl overflow-hidden mb-12 lg:mb-16 shadow-xl border border-zinc-100 bg-gradient-to-br from-[#faf8f5] to-[#f3f0ea] lg:min-h-[480px] flex flex-col lg:flex-row">

          {/* Subtle Abstract Waves Background (Full width) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 0% 50%, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          {/* Desktop: Image at right, curving leftwards */}
          <div
            className="absolute inset-0 z-0 hidden lg:block"
            style={{ clipPath: 'ellipse(60% 120% at 100% 50%)' }}
          >
            <img
              src="https://images.pexels.com/photos/6969962/pexels-photo-6969962.jpeg"
              alt="Colección Principal"
              className="w-full h-full object-cover object-[center_60%]"
            />
          </div>

          {/* Text Content */}
          <div className="relative z-20 w-full lg:w-[50%] p-5 md:p-10 lg:p-16 flex flex-col justify-between h-full">
            
            {/* Top Text Block */}
            <div>
              <h2 className="text-[10px] md:text-[11px] font-bold text-store-primary uppercase tracking-[0.25em] mb-2 lg:mb-4">
                Nueva Colección {new Date().getFullYear()}
              </h2>

              <h1 className="text-4xl md:text-6xl lg:text-7xl text-zinc-900 mb-3 lg:mb-5 tracking-tight leading-[1.05] flex flex-wrap items-baseline gap-x-2 lg:gap-x-3">
                <span className="font-sans font-extrabold">{settings?.store_name ? settings.store_name.split(' ')[0] : 'DAREN'}</span>
                <span className="font-serif font-light text-3xl md:text-5xl lg:text-6xl opacity-90">{settings?.store_name?.split(' ').slice(1).join(' ') || 'Style'}</span>
              </h1>

              <p className="text-zinc-500 text-xs md:text-base mb-5 lg:mb-8 max-w-sm leading-relaxed font-medium">
                {settings?.description || 'Descubre piezas únicas que realzan tu personalidad y te acompañan en cada momento especial.'}
              </p>

              <div className="mb-4 lg:mb-10">
                <Link to={buildUrl("/catalog")} className="inline-flex items-center justify-center bg-store-primary hover:bg-store-primary/90 text-white text-[11px] lg:text-xs font-bold uppercase tracking-widest px-6 lg:px-8 py-3 lg:py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl shadow-store-primary/20 w-auto">
                  Explorar Catálogo <ArrowRight className="ml-2 w-4 h-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {/* Mobile Image (Inline between text and features) */}
            <div className="w-[calc(100%+2.5rem)] -mx-5 h-[160px] relative lg:hidden mb-5 mt-1">
              <img
                src="https://images.pexels.com/photos/6969962/pexels-photo-6969962.jpeg"
                alt="Colección Principal"
                className="w-full h-full object-cover object-[center_30%]"
                style={{ clipPath: 'ellipse(150% 100% at 50% 100%)' }}
              />
            </div>

            {/* Mini Features (Hero Bottom) */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-y-3 gap-x-2 lg:gap-6 pt-4 lg:pt-5 border-t border-zinc-200/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-store-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-store-primary" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Tendencias</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Exclusivas</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-store-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 text-store-primary" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Calidad</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Premium</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-store-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-store-primary" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Pago 100%</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Seguro</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-store-primary/10 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 text-store-primary" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-800 uppercase tracking-widest">Atención</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Indicators Placeholder */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-1/4 lg:translate-x-0 flex items-center gap-2 z-20">
            <div className="w-2 h-2 rounded-full bg-store-primary"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
          </div>
        </section>
      </div>

      {/* 2. PREMIUM CAROUSEL (DESTACADOS) */}
      <PremiumCarousel />

      {/* 3. CATEGORY BANNERS */}
      <CategoryBanners />

      {/* 4. ÚLTIMAS NOVEDADES (CLEAN GRID) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-12">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-14">
          <h2 className="text-[11px] font-bold text-store-primary uppercase tracking-[0.3em] mb-3">
            Últimos Ingresos
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-zinc-900 tracking-tight">
            Novedades
          </h3>
        </div>

        {loadingNew ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-store-primary" /></div>
        ) : processedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {processedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-100">
            <p className="text-zinc-500">No hay productos publicados aún.</p>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link to={buildUrl("/catalog")} className="inline-flex items-center justify-center bg-white border border-zinc-200 hover:border-store-primary hover:text-store-primary text-zinc-900 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all">
            Ver Todo el Catálogo <ArrowRight className="ml-2 w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

    </div>
  )
}
