import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { catalogService } from '../services/catalog.service'
import { useStore } from '../providers/StoreProvider'
import { ProductCard } from './ProductCard'
import { useStoreRoute } from '../hooks/useStoreRoute'

export function PremiumCarousel() {
  const { tenant } = useStore()
  const { buildUrl } = useStoreRoute()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['public-featured-products', tenant?.id],
    queryFn: () => catalogService.getFeaturedProducts(tenant!.id),
    enabled: !!tenant?.id
  })

  // Auto-play logic (Conveyor Belt)
  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0 || isHovered) return

    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    
    // Adjust speed (lower = slower)
    const speed = 0.5
    let accumulator = 0

    const playMarquee = () => {
      accumulator += speed
      if (accumulator >= 1) {
        scrollContainer.scrollLeft += Math.floor(accumulator)
        accumulator -= Math.floor(accumulator)
      }
      
      // If reached the end of the scrollable area, jump back to start seamlessly
      // (Since we duplicate the list 3 times, we can jump back when we reach the 2nd copy)
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 2) {
        scrollContainer.scrollLeft = 10 // small offset to prevent stutter
      }
      
      animationFrameId = requestAnimationFrame(playMarquee)
    }

    animationFrameId = requestAnimationFrame(playMarquee)

    return () => cancelAnimationFrame(animationFrameId)
  }, [featuredProducts, isHovered])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return
    const amount = direction === 'left' ? -350 : 350
    container.scrollBy({ left: amount, behavior: 'smooth' })
  }

  // Create an extended list for the infinite effect
  const infiniteProducts = featuredProducts ? [...featuredProducts, ...featuredProducts, ...featuredProducts] : []

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-store-primary" />
      </div>
    )
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return null
  }

  return (
    <section className="w-full py-6 lg:py-10 relative overflow-hidden bg-transparent">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 group">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 lg:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-[2px] bg-store-primary"></div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-zinc-900 tracking-tight">
              Destacados Exclusivos
            </h2>
          </div>
          
          <Link 
            to={buildUrl("/catalog")}
            className="flex items-center gap-2 text-xs md:text-sm font-bold text-store-primary uppercase tracking-widest hover:text-store-primary/80 transition-colors"
          >
            Ver Todo <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Controls (Floating Over edges) */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-zinc-100 flex items-center justify-center text-zinc-600 hover:text-store-primary hover:scale-105 transition-all hidden md:flex opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-zinc-100 flex items-center justify-center text-zinc-600 hover:text-store-primary hover:scale-105 transition-all hidden md:flex opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Track */}
          <div 
            className="relative -mx-4 sm:mx-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 lg:gap-6 pb-2 px-4 sm:px-2 hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Inject global style to hide webkit scrollbar in this specific container */}
              <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
              
              {infiniteProducts.map((product: any, idx: number) => (
                <div key={`${product.id}-${idx}`} className="shrink-0 w-[260px] sm:w-[280px] lg:w-[300px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
