import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { ShoppingBag, Search, Menu, Heart } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { SearchPalette } from './SearchPalette'
import { StoreFooter } from './StoreFooter'
import { useCart } from '../hooks/useCart'
import { CartDrawer } from './CartDrawer'

export function StoreLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { tenant, settings } = useStore()
  const { wishlist } = useWishlist()
  const { totalItems, setIsOpen: setIsCartOpen } = useCart()
  
  const { data: categories } = useQuery({
    queryKey: ['public-categories', tenant?.id],
    queryFn: () => catalogService.getCategories(tenant!.id),
    enabled: !!tenant?.id
  })
  
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#fcf9f9] selection:bg-store-primary/20 selection:text-store-primary">
      {/* Top Banner (Optional for premium feel) */}
      <div className="bg-store-primary/20 text-store-primary text-[10px] font-bold tracking-widest uppercase py-2 text-center">
        Envíos a nivel nacional • Atención premium
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-zinc-100 transition-all shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu */}
            <div className="flex items-center lg:hidden">
              <button className="text-zinc-900 p-2 -ml-2">
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center lg:w-48">
              <Link to="/" className="flex items-center gap-2">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-10 w-auto object-contain" />
                ) : (
                  <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                    {settings?.store_name || tenant?.name}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation (Center) */}
            <nav className="hidden lg:flex items-center justify-center space-x-10 flex-1">
              <Link to="/catalog" className="text-[11px] font-bold text-store-primary uppercase tracking-widest transition-colors">Catálogo</Link>
              {categories?.slice(0, 3).map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="text-[11px] font-bold text-zinc-600 hover:text-store-primary uppercase tracking-widest transition-colors">
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center justify-end space-x-4 lg:w-48">
              {/* Desktop Search */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 text-zinc-600 hover:text-store-primary transition-colors group"
              >
                <Search className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Buscar</span>
              </button>

              {/* Mobile Search Icon */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-zinc-600 hover:text-store-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="p-2 text-zinc-600 hover:text-store-primary transition-colors relative flex flex-col items-center group">
                <div className="relative">
                  <Heart className="w-[22px] h-[22px]" strokeWidth={2} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-store-primary/20 text-store-primary text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest mt-1.5 text-zinc-400 group-hover:text-store-primary">Favoritos</span>
              </Link>

              {/* Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-zinc-600 hover:text-store-primary transition-colors relative flex flex-col items-center group"
              >
                <div className="relative">
                  <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={2} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-store-primary/20 text-store-primary text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest mt-1.5 text-zinc-400 group-hover:text-store-primary">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <StoreFooter />
      <CartDrawer />
    </div>
  )
}
