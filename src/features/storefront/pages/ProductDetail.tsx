import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ArrowLeft, Heart, ShoppingCart, Lock, Search, ChevronDown, ChevronLeft, ChevronRight, Award, Truck, Headset, CheckCircle2 } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { toast } from 'sonner'

export function ProductDetail() {
  const { tenant, settings } = useStore()
  const { slug } = useParams<{ slug: string }>()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { buildUrl } = useStoreRoute()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { data: product, isLoading } = useQuery({
    queryKey: ['public-product', tenant?.id, slug],
    queryFn: () => catalogService.getProductBySlug(tenant!.id, slug!),
    enabled: !!tenant?.id && !!slug
  })

  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCart()

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-store-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-serif text-zinc-900 mb-4">Producto no encontrado</h1>
        <p className="text-zinc-600 mb-6">El producto que buscas no existe o fue retirado.</p>
        <Link to={buildUrl("/catalog")} className="text-sm font-medium underline text-zinc-500 hover:text-zinc-900 transition-colors">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const images = product.images || []
  const primaryImage = images.find((i) => i.is_primary) || images[0]
  const displayImage = images[activeImageIndex] || primaryImage

  const variants = product.variants || []
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  
  const activeVariantObj = selectedVariant ? variants.find((v) => v.id === selectedVariant) : null
  const currentPrice = activeVariantObj?.price || product.price
  const originalPrice = product.compare_at_price || currentPrice
  
  let discountPercentage = 0
  if (isOnSale && originalPrice > 0) {
    discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Por favor, selecciona una talla/variante antes de continuar.', {
        position: 'top-center',
        style: { background: '#FFF0F3', color: '#D8548F', borderColor: '#F7D6DE', fontSize: '13px', fontWeight: 'bold' }
      })
      return
    }

    addItem({
      id: `${product.id}-${selectedVariant || 'default'}`,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      variantId: activeVariantObj?.id,
      variantName: activeVariantObj?.name,
      imageUrl: primaryImage?.public_url,
      stock: activeVariantObj ? activeVariantObj.stock : undefined
    })

    toast.success('Producto agregado al carrito', {
      position: 'top-center',
      icon: '🛍️',
      style: { background: '#fff', color: '#18181b', borderColor: '#e4e4e7', fontSize: '13px', fontWeight: 'bold' }
    })
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft
      const width = scrollContainerRef.current.offsetWidth
      const newIndex = Math.round(scrollPosition / width)
      setActiveImageIndex(newIndex)
    }
  }

  const toggleAcc = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  return (
    <div className="w-full bg-[#fcf9f9] min-h-screen pb-20 lg:pb-32 font-sans selection:bg-store-primary/20 selection:text-store-primary">
      <div className="max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8 pt-4 lg:pt-12">
        
        {/* Desktop Breadcrumb */}
        <div className="hidden lg:block mb-8 px-4 lg:px-0">
          <Link to={buildUrl("/catalog")} className="inline-flex items-center text-[11px] font-bold text-zinc-500 hover:text-store-primary transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-16">
          
          {/* ================= LEFT SIDE (IMAGES & BANNERS) ================= */}
          <div className="w-full lg:w-[55%] flex flex-col relative bg-white lg:bg-transparent">
            
            {/* Mobile Header (Absolute over image) */}
            <div className="lg:hidden absolute top-4 left-4 z-10 flex gap-4 w-full px-4">
              <Link to={buildUrl("/catalog")} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-sm text-zinc-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            {/* ----- DESKTOP IMAGE LAYOUT ----- */}
            <div className="hidden lg:flex gap-6 h-[750px]">
              {/* Vertical Thumbnails */}
              {images.length > 1 && (
                <div className="w-24 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-10 relative">
                  {images.map((img, idx) => (
                    <button 
                      key={img.id} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white ${activeImageIndex === idx ? 'border-store-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img.public_url} alt={`${product.name} ${idx+1}`} className="w-full h-full object-contain p-2" />
                    </button>
                  ))}
                  <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-[#fcf9f9] to-transparent pointer-events-none flex items-end justify-center">
                    <ChevronDown className="w-5 h-5 text-zinc-400 bg-[#fcf9f9] rounded-full" />
                  </div>
                </div>
              )}

              {/* Main Desktop Image */}
              <div className="flex-1 relative bg-white rounded-3xl overflow-hidden group border border-zinc-100 shadow-sm">
                {displayImage ? (
                  <img src={displayImage.public_url} alt={product.name} className="w-full h-full object-contain p-8" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">Sin imagen</div>
                )}
                <button className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-zinc-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ----- MOBILE IMAGE LAYOUT ----- */}
            <div className="lg:hidden relative w-full aspect-[4/5] bg-white border-b border-zinc-100 group">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
              >
                {images.length > 0 ? (
                  images.map((img) => (
                    <div key={img.id} className="min-w-full h-full snap-center relative">
                      <img src={img.public_url} alt={product.name} className="w-full h-full object-contain p-4" />
                    </div>
                  ))
                ) : (
                  <div className="min-w-full h-full snap-center flex items-center justify-center text-zinc-400">Sin imagen</div>
                )}
              </div>
              
              {/* Mobile Image Navigation UI */}
              {images.length > 1 && (
                <>
                  <div className="absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-zinc-700 pointer-events-none opacity-80">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-zinc-700 pointer-events-none opacity-80">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Features Bar (Under Image) */}
            <div className="hidden lg:grid grid-cols-4 gap-4 mt-12 bg-white rounded-3xl border border-zinc-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="w-7 h-7 text-zinc-700 mb-3" strokeWidth={1.5} />
                <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-1">Calidad Premium</h5>
                <p className="text-[10px] text-zinc-500">Materiales superiores</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Award className="w-7 h-7 text-zinc-700 mb-3" strokeWidth={1.5} />
                <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-1">Diseño Exclusivo</h5>
                <p className="text-[10px] text-zinc-500">Piezas únicas</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Truck className="w-7 h-7 text-zinc-700 mb-3" strokeWidth={1.5} />
                <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-1">Envíos Rápidos</h5>
                <p className="text-[10px] text-zinc-500">A todo el Perú</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Headset className="w-7 h-7 text-zinc-700 mb-3" strokeWidth={1.5} />
                <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-1">Atención Experta</h5>
                <p className="text-[10px] text-zinc-500">Asesoría personalizada</p>
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE (PRODUCT DATA) ================= */}
          <div className="w-full lg:w-[45%] flex flex-col px-5 lg:px-0 pt-8 lg:pt-0">
            
            {/* Category & Title Header */}
            <div className="mb-6">
              {product.categories && (
                <div className="text-[10px] font-bold text-store-primary uppercase tracking-[0.2em] mb-3">
                  {product.categories.name}
                </div>
              )}
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl lg:text-[42px] font-serif text-zinc-900 leading-[1.1] tracking-tight">
                  {product.name}
                </h1>
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 shrink-0 rounded-full hover:bg-zinc-100 transition-colors"
                >
                  <Heart className={`w-6 h-6 lg:w-7 lg:h-7 ${isInWishlist(product.id) ? 'fill-store-primary text-store-primary' : 'text-zinc-400'}`} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            
            {/* Prices */}
            <div className="flex items-center gap-4 mb-10 border-b border-zinc-100 pb-8">
              {isOnSale && (
                <span className="text-xl lg:text-2xl text-zinc-400 line-through decoration-zinc-300">
                  S/ {Number(originalPrice).toFixed(2)}
                </span>
              )}
              <span className="text-2xl lg:text-3xl font-bold text-store-primary">
                S/ {Number(currentPrice).toFixed(2)}
              </span>
              {discountPercentage > 0 && (
                <span className="bg-store-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* VARIANTS */}
            {variants.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Talla / Variante</h3>
                  <button className="text-[11px] text-zinc-500 underline underline-offset-4 flex items-center gap-1 hover:text-zinc-900 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Guía de tallas
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => {
                    const isSelected = selectedVariant === variant.id
                    const isOutOfStock = variant.stock === 0
                    
                    return (
                      <button
                        key={variant.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`
                          min-w-[70px] py-3.5 px-5 text-[11px] font-bold uppercase tracking-widest border transition-all rounded-xl
                          ${isSelected 
                            ? 'border-store-primary text-store-primary bg-store-primary/5' 
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'}
                          ${isOutOfStock ? 'opacity-40 cursor-not-allowed bg-zinc-50 line-through text-zinc-400 border-zinc-100' : ''}
                        `}
                      >
                        {variant.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mb-12">
              <button 
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 bg-store-primary text-white font-bold text-xs uppercase tracking-widest py-5 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 transition-all"
                style={{ boxShadow: `0 8px 20px ${tenant?.primary_color ? tenant.primary_color + '40' : 'rgba(0,0,0,0.12)'}` }}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                Agregar al Carrito
              </button>
              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 mt-5 font-medium tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                Compra 100% segura y protegida
              </div>
            </div>

            {/* PRODUCT DETAILS (DESKTOP) */}
            <div className="hidden lg:block mb-10">
              <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-store-primary"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Detalles del Producto
              </h3>
              <div className="text-zinc-500 text-[13px] leading-relaxed whitespace-pre-wrap pl-7">
                {product.description || 'Una pieza exclusiva diseñada para impresionar. Cada detalle ha sido cuidadosamente seleccionado para asegurar la máxima calidad y un ajuste perfecto.'}
              </div>
            </div>

            {/* ACCORDIONS */}
            <div className="border-t border-zinc-200">
              
              {/* Product Details (MOBILE ONLY - as accordion) */}
              <div className="border-b border-zinc-200 lg:hidden">
                <button 
                  onClick={() => toggleAcc('details')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 group-hover:text-store-primary"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Detalles del Producto</span>
                  </div>
                  <span className="text-xl text-zinc-400 font-light">{openAccordion === 'details' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'details' && (
                  <div className="pb-6 pt-2 pl-7 text-zinc-500 text-[13px] leading-relaxed fade-in">
                    {product.description || 'Una pieza exclusiva diseñada para impresionar. Cada detalle ha sido cuidadosamente seleccionado para asegurar la máxima calidad y un ajuste perfecto.'}
                  </div>
                )}
              </div>

              {/* Composition */}
              <div className="border-b border-zinc-200">
                <button 
                  onClick={() => toggleAcc('care')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 group-hover:text-store-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Composición y Cuidado</span>
                  </div>
                  <span className="text-xl text-zinc-400 font-light">{openAccordion === 'care' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-6 pt-2 pl-7 text-zinc-500 text-[13px] leading-relaxed fade-in">
                    Lavar a mano con agua fría. No usar blanqueador. Secar a la sombra. Planchar a temperatura baja. Esta prenda ha sido confeccionada con materiales delicados que requieren cuidado especial.
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="border-b border-zinc-200">
                <button 
                  onClick={() => toggleAcc('shipping')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-zinc-400 group-hover:text-store-primary" />
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Envíos y Devoluciones</span>
                  </div>
                  <span className="text-xl text-zinc-400 font-light">{openAccordion === 'shipping' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-6 pt-2 pl-7 text-zinc-500 text-[13px] leading-relaxed fade-in">
                    Realizamos envíos a nivel nacional. Los cambios pueden realizarse hasta 7 días después de recibir el producto, siempre y cuando este mantenga sus etiquetas originales y no muestre señales de uso. {settings?.phone ? `Para más info contáctenos al ${settings.phone}.` : ''}
                  </div>
                )}
              </div>

              {/* Guarantee */}
              <div className="border-b border-zinc-200">
                <button 
                  onClick={() => toggleAcc('guarantee')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400 group-hover:text-store-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Garantía de Satisfacción</span>
                  </div>
                  <span className="text-xl text-zinc-400 font-light">{openAccordion === 'guarantee' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'guarantee' && (
                  <div className="pb-6 pt-2 pl-7 text-zinc-500 text-[13px] leading-relaxed fade-in">
                    Confiamos en la calidad de nuestros productos. Si no estás 100% satisfecho con tu compra, te ofrecemos soluciones inmediatas y cambios ágiles.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile Features Bar (Bottom) */}
      <div className="lg:hidden mt-16 px-4">
        <div className="grid grid-cols-4 gap-2 bg-white rounded-2xl border border-zinc-100 py-6 px-2 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="w-5 h-5 text-zinc-700 mb-2" strokeWidth={1.5} />
            <h5 className="text-[8px] font-bold text-zinc-900 uppercase tracking-wider mb-1 leading-tight">Calidad<br/>Premium</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <Award className="w-5 h-5 text-zinc-700 mb-2" strokeWidth={1.5} />
            <h5 className="text-[8px] font-bold text-zinc-900 uppercase tracking-wider mb-1 leading-tight">Diseño<br/>Exclusivo</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <Truck className="w-5 h-5 text-zinc-700 mb-2" strokeWidth={1.5} />
            <h5 className="text-[8px] font-bold text-zinc-900 uppercase tracking-wider mb-1 leading-tight">Envíos<br/>Rápidos</h5>
          </div>
          <div className="flex flex-col items-center text-center">
            <Headset className="w-5 h-5 text-zinc-700 mb-2" strokeWidth={1.5} />
            <h5 className="text-[8px] font-bold text-zinc-900 uppercase tracking-wider mb-1 leading-tight">Atención<br/>Experta</h5>
          </div>
        </div>
      </div>

    </div>
  )
}
