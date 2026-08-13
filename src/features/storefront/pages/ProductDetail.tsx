import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ArrowLeft, Heart } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { useWishlist } from '../hooks/useWishlist'
import { useCart } from '../hooks/useCart'
import { toast } from 'sonner'

export function ProductDetail() {
  const { tenant, settings } = useStore()
  const { slug } = useParams<{ slug: string }>()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const { data: rawProduct, isLoading } = useQuery({
    queryKey: ['public-product', tenant?.id, slug],
    queryFn: () => catalogService.getProductBySlug(tenant!.id, slug!),
    enabled: !!tenant?.id && !!slug
  })

  const product = rawProduct as any
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCart()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-zinc-900 mb-4">Producto no encontrado</h1>
        <Link to="/catalog" className="text-sm font-medium underline text-zinc-500 hover:text-zinc-900 transition-colors">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  // @ts-ignore
  const images = product.product_images || []
  const primaryImage = images.find((i: any) => i.is_primary) || images[0]
  const otherImages = images.filter((i: any) => i.id !== primaryImage?.id)
  
  // @ts-ignore
  const variants = product.product_variants || []
  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  
  // Get currently selected variant object to show specific price/stock if needed
  const activeVariantObj = selectedVariant ? variants.find((v: any) => v.id === selectedVariant) : null

  const currentPrice = activeVariantObj?.price || product.price

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error('Por favor, selecciona una talla/variante antes de continuar.', {
        position: 'top-center',
        style: {
          background: '#FFF0F3',
          color: '#D8548F',
          borderColor: '#F7D6DE',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }
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
      style: {
        background: '#fff',
        color: '#18181b',
        borderColor: '#e4e4e7',
        fontSize: '13px',
        fontWeight: 'bold',
      }
    })
  }

  return (
    <div className="w-full fade-in font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/catalog" className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al catálogo
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          
          {/* IMAGE GALLERY */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
              {primaryImage ? (
                <img src={primaryImage.public_url} alt={product.name} className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">Sin imagen</div>
              )}
            </div>
            {otherImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {otherImages.map((img: any) => (
                  <div key={img.id} className="aspect-[3/4] bg-zinc-100 overflow-hidden cursor-pointer">
                    <img src={img.public_url} alt={product.name} className="w-full h-full object-cover object-center" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT DETAILS */}
          <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-12">
            
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 tracking-tight pr-4 leading-[1.1]">
                {product.name}
              </h1>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="p-3 mt-1 shrink-0 rounded-full bg-zinc-50 hover:bg-zinc-100 transition-colors"
              >
                <Heart className={`w-[22px] h-[22px] ${isInWishlist(product.id) ? 'fill-store-primary text-store-primary' : 'text-zinc-400'}`} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              {isOnSale && !activeVariantObj && (
                <span className="text-lg text-zinc-400 line-through">
                  S/ {Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-store-primary">
                S/ {Number(activeVariantObj?.price || product.price).toFixed(2)}
              </span>
            </div>

            {/* VARIANTS */}
            {variants.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Talla / Variante</h3>
                  <button className="text-xs text-zinc-500 underline hover:text-zinc-900">Guía de tallas</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant: any) => {
                    const isSelected = selectedVariant === variant.id
                    const isOutOfStock = variant.stock_quantity === 0
                    
                    return (
                      <button
                        key={variant.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariant(variant.id)}
                        className={`
                          min-w-[60px] py-3 px-4 text-xs font-bold uppercase tracking-widest border transition-all rounded-xl
                          ${isSelected 
                            ? 'border-store-primary bg-store-primary text-white shadow-md' 
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-store-primary hover:text-store-primary'}
                          ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-zinc-50 line-through text-zinc-400 border-zinc-100' : ''}
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
                className="w-full block text-center bg-store-primary text-white font-bold text-xs uppercase tracking-widest py-5 rounded-2xl shadow-sm hover:shadow-lg hover:opacity-90 transition-all"
              >
                Agregar al Carrito
              </button>
              <p className="text-xs text-zinc-500 mt-4 text-center">
                Atención personalizada. Podrás revisar tus productos antes de finalizar la compra.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="prose prose-sm prose-zinc">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-4">Detalles del Producto</h3>
              <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {product.description || 'Una pieza exclusiva diseñada para impresionar. Cada detalle ha sido cuidadosamente seleccionado para asegurar la máxima calidad y un ajuste perfecto.'}
              </div>
            </div>

            {/* ACCORDIONS */}
            <div className="mt-12 border-t border-zinc-200">
              <div className="border-b border-zinc-200">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Composición y Cuidado</span>
                  <span className="text-lg text-zinc-400">{openAccordion === 'care' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'care' && (
                  <div className="pb-5 text-zinc-600 text-sm leading-relaxed fade-in">
                    Lavar a mano con agua fría. No usar blanqueador. Secar a la sombra. Planchar a temperatura baja. Esta prenda ha sido confeccionada con materiales delicados que requieren cuidado especial.
                  </div>
                )}
              </div>
              <div className="border-b border-zinc-200">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full py-5 flex justify-between items-center cursor-pointer group outline-none"
                >
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Envíos y Devoluciones</span>
                  <span className="text-lg text-zinc-400">{openAccordion === 'shipping' ? '-' : '+'}</span>
                </button>
                {openAccordion === 'shipping' && (
                  <div className="pb-5 text-zinc-600 text-sm leading-relaxed fade-in">
                    Realizamos envíos a nivel nacional. Los cambios pueden realizarse hasta 7 días después de recibir el producto, siempre y cuando este mantenga sus etiquetas originales y no muestre señales de uso. {settings?.phone ? `Para más info contáctenos al ${settings.phone}.` : ''}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
