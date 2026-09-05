import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { CatalogProductCard } from '../components/CatalogProductCard'
import { useWishlist } from '../hooks/useWishlist'
import { useStoreRoute } from '../hooks/useStoreRoute'

export function WishlistView() {
  const { tenant } = useStore()
  const { wishlist } = useWishlist()
  const { buildUrl } = useStoreRoute()
  
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['public-products', tenant?.id],
    queryFn: () => catalogService.getProducts(tenant!.id),
    enabled: !!tenant?.id
  })

  // Filter only the products that are in the wishlist
  const wishedProducts = allProducts?.filter(p => wishlist.includes(p.id)) || []

  return (
    <div className="w-full fade-in font-sans bg-background min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        
        {/* Premium Inline Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lg:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-store-primary mb-2">
              <Heart className="w-4 h-4 fill-store-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Tu Selección</span>
            </div>
            <h1 className="text-3xl lg:text-[42px] font-serif text-foreground leading-none tracking-tight">
              Mis Favoritos
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-right max-w-xs">
            Los artículos que más te han gustado, guardados en un solo lugar.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-store-primary" /></div>
        ) : wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {wishedProducts.map(product => (
              <CatalogProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-16 text-center border border-zinc-100 dark:border-zinc-800 shadow-sm max-w-2xl mx-auto mt-8">
            <Heart className="w-12 h-12 text-zinc-200 mx-auto mb-6" />
            <h3 className="text-xl font-serif text-foreground mb-4">Aún no tienes favoritos</h3>
            <p className="text-muted-foreground text-sm mb-8">
              Guarda tus artículos preferidos tocando el ícono de corazón en cualquier producto para que no los pierdas de vista.
            </p>
            <Link 
              to={buildUrl('/catalog')} 
              className="inline-flex items-center justify-center bg-store-primary text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
            >
              Explorar Catálogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
