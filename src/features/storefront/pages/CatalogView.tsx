import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { CatalogProductCard } from '../components/CatalogProductCard'
import { useStoreRoute } from '../hooks/useStoreRoute'

export function CatalogView({ type = 'all' }: { type?: 'all' | 'category' | 'collection' }) {
  const { tenant } = useStore()
  const { buildUrl } = useStoreRoute()
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || undefined

  const categorySlug = type === 'category' ? slug : undefined
  const collectionSlug = type === 'collection' ? slug : undefined

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['public-products', tenant?.id, categorySlug, collectionSlug, searchQuery],
    queryFn: () => catalogService.getProducts(tenant!.id, categorySlug, collectionSlug, searchQuery),
    enabled: !!tenant?.id
  })

  // Fetch categories and collections for the sidebar/filters
  const { data: categories } = useQuery({
    queryKey: ['public-categories', tenant?.id],
    queryFn: () => catalogService.getCategories(tenant!.id),
    enabled: !!tenant?.id
  })

  const { data: collections } = useQuery({
    queryKey: ['public-collections', tenant?.id],
    queryFn: () => catalogService.getCollections(tenant!.id),
    enabled: !!tenant?.id
  })

  // States for buttons

  const [sortBy, setSortBy] = useState('newest') // newest, price_asc, price_desc
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)

  // Process products (Sort & Paginate)
  const processedProducts = products ? [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price)
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // newest
  }) : []
  const visibleProducts = processedProducts.slice(0, visibleCount)

  let pageTitle = 'Catálogo Completo'
  let pageSubtitle = 'Descubre piezas únicas que realzan tu esencia.'

  if (searchQuery) {
    pageTitle = `Búsqueda: "${searchQuery}"`
    pageSubtitle = `Resultados encontrados para tu búsqueda.`
  } else if (type === 'category' && categories && slug) {
    const cat = categories.find(c => c.slug === slug)
    if (cat) {
      pageTitle = cat.name
      pageSubtitle = `Explora nuestra exclusiva selección de ${cat.name.toLowerCase()}.`
    }
  } else if (type === 'collection' && collections && slug) {
    const col = collections.find(c => c.slug === slug)
    if (col) {
      pageTitle = col.name
      pageSubtitle = `Descubre los diseños exclusivos de la colección ${col.name}.`
    }
  }

  return (
    <div className="w-full fade-in font-sans bg-[#fcf9f9] pb-10">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* PAGE TITLE */}
        <div className="mb-10 lg:mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 tracking-tight mb-2">
            {pageTitle}
          </h1>
          <p className="text-zinc-500 text-sm">
            {pageSubtitle}
          </p>
        </div>

        {/* MAIN LAYOUT (SIDEBAR + GRID) */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {/* Categorías */}
            <div className="mb-8">
              <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest mb-4 px-2">Categorías</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    to={buildUrl("/catalog")}
                    className={`block px-3 py-2.5 rounded-xl text-sm transition-all ${type === 'all' ? 'bg-store-primary/10 text-store-primary font-bold' : 'text-zinc-600 hover:text-store-primary hover:bg-zinc-50'}`}
                  >
                    Todo el catálogo
                  </Link>
                </li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <Link
                      to={buildUrl(`/category/${cat.slug}`)}
                      className={`block px-3 py-2.5 rounded-xl text-sm transition-all ${categorySlug === cat.slug ? 'bg-store-primary/10 text-store-primary font-bold' : 'text-zinc-600 hover:text-store-primary hover:bg-zinc-50'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colecciones */}
            {collections && collections.length > 0 && (
              <div className="mb-8">
                <h4 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest mb-4 px-2">Colecciones</h4>
                <ul className="space-y-1">
                  {collections.map(col => (
                    <li key={col.id}>
                      <Link
                        to={buildUrl(`/collection/${col.slug}`)}
                        className={`block px-3 py-2.5 rounded-xl text-sm transition-all ${collectionSlug === col.slug ? 'bg-store-primary/10 text-store-primary font-bold' : 'text-zinc-600 hover:text-store-primary hover:bg-zinc-50'}`}
                      >
                        {col.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* RIGHT CONTENT (PRODUCTS) */}
          <main className="flex-1">

            {/* Mobile Sort & Desktop Toolbar */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 lg:mb-8 relative z-50 gap-4">
              <div className="hidden lg:block text-sm text-zinc-500 font-medium">
                Mostrando {visibleProducts.length} de {processedProducts.length} productos
              </div>
              
              <div className="relative self-end lg:self-auto">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-xs lg:text-sm font-bold text-zinc-900 border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 rounded-full transition-colors shadow-sm"
                >
                  {sortBy === 'newest' ? 'MÁS RECIENTES' : sortBy === 'price_asc' ? 'MENOR PRECIO' : 'MAYOR PRECIO'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-xl overflow-hidden py-2 z-50">
                    <button onClick={() => { setSortBy('newest'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'newest' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Más Recientes</button>
                    <button onClick={() => { setSortBy('price_asc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'price_asc' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Precio: Menor a Mayor</button>
                    <button onClick={() => { setSortBy('price_desc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'price_desc' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Precio: Mayor a Menor</button>
                  </div>
                )}
              </div>
            </div>

            {/* MOBILE FILTERS (Horizontal Pills) */}
            <div className="lg:hidden mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 flex gap-2">
              <Link
                to={buildUrl("/catalog")}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${type === 'all' ? 'bg-store-primary text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}
              >
                Todo
              </Link>
              {categories?.map(cat => (
                <Link
                  key={cat.id}
                  to={buildUrl(`/category/${cat.slug}`)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${categorySlug === cat.slug ? 'bg-store-primary text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}
                >
                  {cat.name}
                </Link>
              ))}
              {collections?.map(col => (
                <Link
                  key={col.id}
                  to={buildUrl(`/collection/${col.slug}`)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors ${collectionSlug === col.slug ? 'bg-store-primary text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}
                >
                  {col.name}
                </Link>
              ))}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-store-primary" /></div>
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
                  {visibleProducts.map(product => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Cargar Más */}
                {visibleCount < processedProducts.length && (
                  <div className="flex justify-center border-t border-zinc-200 pt-12">
                    <button 
                      onClick={() => setVisibleCount(v => v + 12)}
                      className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-store-primary text-white text-[11px] font-bold uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      Cargar Más Productos <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.27l-5.67-5.67"/></svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-100">
                <p className="text-zinc-500 mb-4">No se encontraron productos en esta sección.</p>
                {type !== 'all' && (
                  <Link to={buildUrl("/catalog")} className="text-sm font-bold text-store-primary underline hover:opacity-80 transition-opacity">Volver al catálogo completo</Link>
                )}
              </div>
            )}

            {/* Features Bar */}
            <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center flex flex-col items-center">
                <Truck className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Envíos a todo el Perú</h5>
                <p className="text-[11px] text-zinc-500">Recibe tu pedido rápido y seguro.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <ShieldCheck className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Productos 100% Originales</h5>
                <p className="text-[11px] text-zinc-500">Garantizamos autenticidad en cada compra.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-store-primary/80 mb-3"><path d="M21 2v6h-6M21 8l-4-4a9 9 0 0 0-14 3M3 22v-6h6M3 16l4 4a9 9 0 0 0 14-3"/></svg>
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Cambios y Devoluciones</h5>
                <p className="text-[11px] text-zinc-500">Fácil y sin complicaciones dentro de 7 días.</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-store-primary/80 mb-3"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Atención Personalizada</h5>
                <p className="text-[11px] text-zinc-500">Estamos para ayudarte en lo que necesites.</p>
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  )
}
