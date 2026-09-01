import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import type { PublicProduct } from '@/types/catalog'
import { useWishlist } from '../hooks/useWishlist'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { useCart } from '../hooks/useCart'

interface CatalogProductCardProps {
  product: PublicProduct
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary)?.public_url 
    || product.images?.[0]?.public_url
    || '/images/placeholder-product.png' // Fallback image

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const { buildUrl } = useStoreRoute()
  const isWished = isInWishlist(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const defaultVariant = product.variants?.[0]
    
    addItem({
      id: defaultVariant ? `${product.id}-${defaultVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      variantId: defaultVariant?.id,
      variantName: defaultVariant?.name,
      imageUrl: primaryImage,
      stock: defaultVariant ? defaultVariant.stock : undefined
    })
  }

  return (
    <Link to={buildUrl(`/product/${product.slug}`)} className="group block h-full">
      <div className="relative bg-white overflow-hidden rounded-2xl shadow-sm border border-zinc-100 group-hover:shadow-md transition-shadow flex flex-row md:flex-col h-full">
        
        {/* Top Badges (Desktop Top Left, Mobile Top Left) */}
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-store-primary/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm z-20">
            Sale
          </div>
        )}
        
        {/* Wishlist Button (Desktop Top Right, Mobile Top Right) */}
        <button 
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-20 text-zinc-400 hover:text-store-primary"
        >
          <Heart className={`w-[18px] h-[18px] ${isWished ? 'fill-store-primary text-store-primary' : 'currentColor'}`} />
        </button>

        {/* Image Container */}
        <div className="relative w-[120px] md:w-full shrink-0 aspect-square flex items-center justify-center p-3 md:p-4 bg-zinc-50/50">
          <img 
            src={primaryImage} 
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Text Container & Action Button */}
        <div className="flex flex-col flex-grow justify-between p-4 bg-white">
          <div className="text-left mb-4">
            <h3 className="text-[14px] md:text-[15px] font-bold text-zinc-900 group-hover:text-store-primary transition-colors line-clamp-2 md:line-clamp-1 mb-1.5 md:mb-2">
              {product.name}
            </h3>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              {isOnSale && (
                <span className="text-[11px] md:text-xs text-zinc-400 line-through">
                  S/ {Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
              <span className="text-sm md:text-[15px] font-black text-store-primary">
                S/ {Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-store-primary text-white text-[10px] md:text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-colors shadow-sm"
          >
            <span className="hidden md:inline">Añadir al Carrito</span>
            <span className="md:hidden">Añadir</span>
            <ShoppingCart className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>
        </div>

      </div>
    </Link>
  )
}
