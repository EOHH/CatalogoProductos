import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Loader2 } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { ProductCard } from '../components/ProductCard'
import { useWishlist } from '../hooks/useWishlist'

export function WishlistView() {
  const { tenant } = useStore()
  const { wishlist } = useWishlist()
  
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['public-products', tenant?.id],
    queryFn: () => catalogService.getProducts(tenant!.id),
    enabled: !!tenant?.id
  })

  // Filter only the products that are in the wishlist
  const wishedProducts = allProducts?.filter(p => wishlist.includes(p.id)) || []

  return (
    <div className="w-full fade-in font-sans bg-[#fcf9f9] pb-10">
      <div className="bg-white py-16 px-4 mb-16 text-center border-b border-zinc-100 shadow-sm">
        <Heart className="w-8 h-8 text-store-primary mx-auto mb-4" />
        <h1 className="text-3xl md:text-5xl font-serif text-zinc-900 tracking-tight mb-2">Tus Favoritos</h1>
        <p className="text-zinc-500 text-sm">Los artículos que más te han gustado</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-store-primary" /></div>
        ) : wishedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {wishedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-zinc-100 shadow-sm max-w-2xl mx-auto mt-8">
            <Heart className="w-12 h-12 text-zinc-200 mx-auto mb-6" />
            <h3 className="text-xl font-serif text-zinc-900 mb-4">Aún no tienes favoritos</h3>
            <p className="text-zinc-500 text-sm mb-8">
              Guarda tus artículos preferidos tocando el ícono de corazón en cualquier producto para que no los pierdas de vista.
            </p>
            <Link 
              to="/catalog" 
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
