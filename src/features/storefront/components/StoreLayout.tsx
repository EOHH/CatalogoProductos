import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { ShoppingCart, Search, Menu, Heart, X, Truck, ShieldCheck, Award, Headset, Home, Tag } from 'lucide-react'
import { useWishlist } from '../hooks/useWishlist'
import { SearchPalette } from './SearchPalette'
import { StoreFooter } from './StoreFooter'
import { useCart } from '../hooks/useCart'
import { CartDrawer } from './CartDrawer'
import { useStoreRoute } from '../hooks/useStoreRoute'
import { useStoreRealtime } from '../hooks/useStoreRealtime'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useEffect } from 'react'

export function StoreLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { tenant, settings } = useStore()
  const { wishlist, syncWithProducts: syncWishlist } = useWishlist()
  const { totalItems, setIsOpen: setIsCartOpen, syncWithProducts: syncCart } = useCart()
  const { buildUrl } = useStoreRoute()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Activar sincronización en tiempo real del catálogo
  useStoreRealtime()
  
  const { data: categories } = useQuery({
    queryKey: ['public-categories', tenant?.id],
    queryFn: () => catalogService.getCategories(tenant!.id),
    enabled: !!tenant?.id
  })

  // Silent sync query to clean up deleted items from localStorage
  const { data: allProducts } = useQuery({
    queryKey: ['public-products', tenant?.id, 'sync'],
    queryFn: () => catalogService.getProducts(tenant!.id),
    enabled: !!tenant?.id && (wishlist.length > 0 || totalItems > 0),
    staleTime: 0
  })

  useEffect(() => {
    if (allProducts) {
      const validIds = allProducts.map(p => p.id)
      syncWishlist(validIds)
      syncCart(validIds)
    }
  }, [allProducts, syncWishlist, syncCart])

  useEffect(() => {
    if (settings?.store_name || tenant?.name) {
      document.title = settings?.store_name || tenant?.name || 'Tienda'
    }

    const faviconUrl = tenant?.favicon_url || tenant?.logo_url
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [tenant, settings])

  const isActive = (path: string) => location.pathname === buildUrl(path)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(buildUrl(`/catalog?q=${encodeURIComponent(searchQuery)}`))
    }
  }
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="store-ui-theme">
      <div 
        className="min-h-screen flex flex-col font-sans bg-background selection:bg-store-primary/20 selection:text-store-primary"
        style={{ '--store-primary-color': tenant?.primary_color || '#000000' } as React.CSSProperties}
      >
        <ScrollToTop />
      {/* 1. TOP BANNER (Orange) */}
      <div className="bg-store-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest py-2 px-4 relative z-[60]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Envíos a nivel nacional - Atención premium</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-80 lowercase normal-case">¿Necesitas ayuda?</span>
            <Headset className="w-4 h-4 ml-1" />
            <span>+51 920 052 596</span>
          </div>
        </div>
      </div>

      {/* 2. HEADER (Sticky) */}
      <header className="sticky top-0 z-50 bg-card shadow-sm transition-all border-b border-zinc-100 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">
            
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="text-foreground p-2 -ml-2">
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center lg:justify-start flex-1 lg:w-48">
              <Link to={buildUrl("/")} className="flex items-center gap-2">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={settings?.store_name || tenant.name} className="h-12 md:h-14 w-auto object-contain" />
                ) : (
                  <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground text-center lg:text-left">
                    {settings?.store_name || tenant?.name}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center space-x-12 flex-1 px-8">
              <Link 
                to={buildUrl("/catalog")} 
                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors py-2 relative group ${isActive('/catalog') ? 'text-store-primary' : 'text-muted-foreground hover:text-store-primary'}`}
              >
                Catálogo
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-store-primary transition-transform origin-left ${isActive('/catalog') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
              {categories?.slice(0, 3).map(cat => (
                <Link 
                  key={cat.id} 
                  to={buildUrl(`/category/${cat.slug}`)} 
                  className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors py-2 relative group ${isActive(`/category/${cat.slug}`) ? 'text-store-primary' : 'text-muted-foreground hover:text-store-primary'}`}
                >
                  {cat.name}
                  <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-store-primary transition-transform origin-left ${isActive(`/category/${cat.slug}`) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                </Link>
              ))}
              <a 
                href="#footer" 
                className="text-[11px] font-bold uppercase tracking-[0.15em] transition-colors py-2 relative group text-muted-foreground hover:text-store-primary"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
              >
                Contacto
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-store-primary transition-transform origin-left scale-x-0 group-hover:scale-x-100" />
              </a>
            </nav>

            {/* Right Side: Search (Desktop) + Icons */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1 lg:w-auto">
              
              {/* Desktop Search Input */}
              <form onSubmit={handleSearch} className="hidden lg:flex relative items-center mr-4 w-64 group">
                <Search className="absolute left-4 w-4 h-4 text-muted-foreground group-focus-within:text-store-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full text-[13px] text-foreground placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-store-primary focus:border-store-primary transition-all"
                />
              </form>

              {/* Wishlist */}
              <Link to={buildUrl("/wishlist")} className="p-2 text-muted-foreground hover:text-store-primary transition-colors flex flex-col items-center group relative">
                <div className="relative">
                  <Heart className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-store-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border border-card dark:border-zinc-900 shadow-sm">
                      {wishlist.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[9px] font-medium uppercase tracking-widest mt-1.5 text-muted-foreground group-hover:text-store-primary">Favoritos</span>
              </Link>

              {/* Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-muted-foreground hover:text-store-primary transition-colors flex flex-col items-center group relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-foreground text-background text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border border-card dark:border-zinc-900 shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[9px] font-medium uppercase tracking-widest mt-1.5 text-muted-foreground group-hover:text-store-primary">Carrito</span>
              </button>

              {/* Theme Toggle */}
              <div className="flex flex-col items-center justify-center">
                <ThemeToggle showLabel={false} />
              </div>
            </div>
          </div>
          
          {/* Mobile Search Bar (Below Header) */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative items-center w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-store-primary transition-colors" />
              <input 
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-foreground placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-store-primary focus:border-store-primary transition-all"
              />
            </form>
          </div>
        </div>
      </header>

      {/* 3. FEATURES BAR (Global) */}
      <div className="hidden lg:flex justify-center items-center py-5 bg-card border-b border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-30">
        <div className="max-w-[1200px] w-full px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-store-primary/80" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-foreground tracking-wide uppercase">Productos exclusivos</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-store-primary/80" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-foreground tracking-wide uppercase">Calidad premium</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-store-primary/80" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-foreground tracking-wide uppercase">Compra 100% segura</span>
          </div>
          <div className="flex items-center gap-3">
            <Headset className="w-5 h-5 text-store-primary/80" strokeWidth={1.5} />
            <span className="text-[11px] font-medium text-foreground tracking-wide uppercase">Atención personalizada</span>
          </div>
        </div>
        {/* Pequeño detalle inferior decorativo (como en el mockup) */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-card border-b border-r border-zinc-100 dark:border-zinc-800 rotate-45 shadow-[2px_2px_4px_-2px_rgba(0,0,0,0.05)]"></div>
      </div>

      {/* 4. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          {/* Dark Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer Menu */}
          <div className="relative w-full max-w-[320px] bg-store-primary h-full shadow-2xl flex flex-col transform transition-transform duration-300">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center h-20 px-4 border-b border-card dark:border-zinc-900/10 bg-card">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted-foreground p-2 -ml-2 hover:text-store-primary">
                <X className="w-7 h-7" strokeWidth={1.5} />
              </button>
              <div className="flex-1 flex justify-center">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={settings?.store_name} className="h-10 w-auto object-contain" />
                ) : (
                  <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                    {settings?.store_name || tenant?.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link to={buildUrl("/wishlist")} onClick={() => setIsMobileMenuOpen(false)} className="relative text-muted-foreground">
                  <Heart className="w-6 h-6" strokeWidth={1.2} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-store-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <button onClick={() => {setIsMobileMenuOpen(false); setIsCartOpen(true)}} className="relative text-muted-foreground">
                  <ShoppingCart className="w-6 h-6" strokeWidth={1.2} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            </div>

            {/* Drawer Nav Links */}
            <nav className="flex-1 px-6 py-8 overflow-y-auto">
              <ul className="space-y-6">
                <li>
                  <Link 
                    to={buildUrl("/catalog")} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 text-white/90 hover:text-white transition-colors"
                  >
                    <Home className="w-5 h-5 opacity-70" strokeWidth={1.5} />
                    <span className="text-sm font-medium tracking-[0.15em] uppercase">Catálogo</span>
                  </Link>
                </li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to={buildUrl(`/category/${cat.slug}`)} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-white/90 hover:text-white transition-colors"
                    >
                      <Tag className="w-5 h-5 opacity-70" strokeWidth={1.5} />
                      <span className="text-sm font-medium tracking-[0.15em] uppercase">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      <StoreFooter />
      <CartDrawer />
      
      {/* Global Search Palette (Fallback/Hidden usually) */}
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
    </ThemeProvider>
  )
}
