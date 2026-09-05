import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'

export function CategoryBanners() {
  const { tenant } = useStore()
  const { buildUrl } = useStoreRoute()

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['public-categories', tenant?.id],
    queryFn: () => catalogService.getCategories(tenant!.id),
    enabled: !!tenant?.id
  })

  // Fetch all products to use as fallback images
  const { data: products } = useQuery({
    queryKey: ['public-all-products', tenant?.id],
    queryFn: () => catalogService.getProducts(tenant!.id),
    enabled: !!tenant?.id
  })

  if (!categories || categories.length === 0) {
    return null
  }

  // Get top 2 categories to display
  const displayCategories = categories.slice(0, 2)

  // Helper to find a fallback image from a category's products
  const getFallbackImage = (categoryId: string) => {
    if (!products) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop'
    const catProducts = products.filter(p => p.category_id === categoryId)
    for (const p of catProducts) {
      const img = p.images?.find(i => i.is_primary)?.public_url || p.images?.[0]?.public_url
      if (img) return img
    }
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop'
  }

  return (
    <section className="w-full mb-12 lg:mb-16 mt-6 lg:mt-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center mb-10 lg:mb-14">
          <h2 className="text-[11px] font-bold text-store-primary uppercase tracking-[0.3em] mb-3">
            Explora Tu Estilo
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground tracking-tight">
            Colecciones Icónicas
          </h3>
        </div>

        <div className={`grid grid-cols-1 ${displayCategories.length === 2 ? 'md:grid-cols-2' : ''} gap-6 lg:gap-8`}>
          
          {displayCategories.map((cat) => {
            const bgImage = cat.image_url || getFallbackImage(cat.id)
            
            return (
              <Link 
                key={cat.id}
                to={buildUrl(`/category/${cat.slug}`)} 
                className="group relative h-[350px] lg:h-[450px] rounded-[2rem] overflow-hidden flex items-end p-8 lg:p-12"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={bgImage} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 w-full">
                  <h4 className="text-white font-serif text-3xl lg:text-4xl mb-2 lg:mb-3">{cat.name}</h4>
                  <p className="text-white/80 text-sm lg:text-base font-medium mb-6 max-w-sm line-clamp-2">
                    {cat.description || `Explora lo mejor de nuestra colección de ${cat.name.toLowerCase()} y descubre piezas únicas.`}
                  </p>
                  
                  <div className="inline-flex items-center text-xs font-bold text-white uppercase tracking-widest group-hover:text-store-primary transition-colors">
                    Ver Colección
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-2" strokeWidth={2.5} />
                  </div>
                </div>
              </Link>
            )
          })}

        </div>
      </div>
    </section>
  )
}
