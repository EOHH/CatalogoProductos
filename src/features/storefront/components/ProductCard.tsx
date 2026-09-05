import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import type { PublicProduct } from '@/types/catalog'
import { useWishlist } from '../hooks/useWishlist'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { useCart } from '../hooks/useCart'

interface ProductCardProps {
  product: PublicProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary)?.public_url 
    || product.images?.[0]?.public_url
    || '/images/placeholder-product.png' // Fallback image

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const { buildUrl } = useStoreRoute()
  const isWished = isInWishlist(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir la navegación al enlace
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
      <div className="relative aspect-[4/5] bg-card overflow-hidden rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 group-hover:shadow-md transition-shadow flex flex-col justify-between">
        
        {/* Top Badges */}
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-store-primary/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-sm z-20">
            Sale
          </div>
        )}
        
        {/* Actions (Wishlist & Cart) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button 
            onClick={handleWishlistClick}
            className="p-2.5 bg-card/90 backdrop-blur rounded-full shadow-sm hover:bg-card hover:scale-110 transition-all text-muted-foreground hover:text-store-primary"
            title="Añadir a favoritos"
          >
            <Heart className={`w-[18px] h-[18px] ${isWished ? 'fill-store-primary text-store-primary' : 'currentColor'}`} />
          </button>
          
          <button 
            onClick={handleAddToCart}
            className="p-2.5 bg-card/90 backdrop-blur rounded-full shadow-sm hover:bg-store-primary hover:text-white hover:scale-110 transition-all text-muted-foreground opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            title="Añadir al carrito"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Image */}
        <div className="relative flex-grow flex items-center justify-center p-4">
          <img 
            src={primaryImage} 
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Text Container (Inside Card) */}
        <div className="relative z-10 w-full px-4 pb-4 pt-8 bg-gradient-to-t from-white dark:from-card via-white dark:via-card to-transparent text-left">
          <h3 className="text-[14px] font-bold text-foreground group-hover:text-store-primary transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {isOnSale && (
              <span className="text-[11px] text-muted-foreground line-through">
                S/ {Number(product.compare_at_price).toFixed(2)}
              </span>
            )}
            <span className="text-sm font-black text-store-primary">
              S/ {Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
