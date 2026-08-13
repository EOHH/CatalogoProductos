import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Product } from '@/types/catalog'
import { useWishlist } from '../hooks/useWishlist'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // @ts-ignore - We joined product_images in the query
  const primaryImage = product.product_images?.find(img => img.is_primary)?.public_url 
    // @ts-ignore
    || product.product_images?.[0]?.public_url
    || '/images/placeholder-product.png' // Fallback image

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  
  const { isInWishlist, toggleWishlist } = useWishlist()
  const isWished = isInWishlist(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir la navegación al enlace
    e.stopPropagation()
    toggleWishlist(product.id)
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-zinc-100 overflow-hidden mb-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
        <img 
          src={primaryImage} 
          alt={product.name}
          className="object-cover w-full h-full object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-store-primary/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
            Sale
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-10 text-zinc-400 hover:text-store-primary"
        >
          <Heart className={`w-[18px] h-[18px] ${isWished ? 'fill-store-primary text-store-primary' : 'currentColor'}`} />
        </button>
      </div>
      <div className="text-left px-1">
        <h3 className="text-[15px] font-bold text-zinc-900 group-hover:text-store-primary transition-colors line-clamp-1 mb-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {isOnSale && (
            <span className="text-xs text-zinc-400 line-through">
              S/ {Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
          <span className="text-sm font-bold text-store-primary">
            S/ {Number(product.price).toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  )
}
