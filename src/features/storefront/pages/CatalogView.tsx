import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ChevronDown, Filter, Heart, Loader2, ShieldCheck, Award, Truck, Headset, X } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { ProductCard } from '../components/ProductCard'

export function CatalogView({ type = 'all' }: { type?: 'all' | 'category' | 'collection' }) {
  const { tenant } = useStore()
  const { slug } = useParams<{ slug: string }>()

  const categorySlug = type === 'category' ? slug : undefined
  const collectionSlug = type === 'collection' ? slug : undefined

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['public-products', tenant?.id, categorySlug, collectionSlug],
    queryFn: () => catalogService.getProducts(tenant!.id, categorySlug, collectionSlug),
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // newest, price_asc, price_desc
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  // Process products (Sort & Paginate)
  const processedProducts = products ? [...products].sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price)
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price)
    return 0 // newest (default order from DB)
  }) : []
  const visibleProducts = processedProducts.slice(0, visibleCount)

  let pageTitle = 'Catálogo Completo'
  let pageSubtitle = 'Descubre piezas únicas que realzan tu esencia.'

  if (type === 'category' && categories && slug) {
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

        {/* HEADER BLOCK */}
        <section className="relative w-full rounded-3xl overflow-hidden mb-16 shadow-sm border border-zinc-100 bg-gradient-to-r from-store-primary/5 via-store-primary/10 to-store-primary/5 py-16 md:py-24 text-center">
          {/* Decorative subtle background (Floral abstract alternative) */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-multiply"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>

          <div className="relative z-10 max-w-2xl mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-serif text-zinc-900 tracking-tight mb-4">
              {pageTitle}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4 opacity-30">
              <div className="h-px w-12 bg-store-primary"></div>
              <Heart className="w-4 h-4 text-store-primary fill-store-primary" />
              <div className="h-px w-12 bg-store-primary"></div>
            </div>
            <p className="text-zinc-600 text-sm md:text-base">
              {pageSubtitle}
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT (SIDEBAR + GRID) */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          
          {/* Mobile Filter Overlay */}
          {isFilterOpen && (
            <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          )}

          {/* SIDEBAR */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white p-6 overflow-y-auto transition-transform transform ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:z-auto flex-shrink-0 space-y-8 lg:space-y-12 shadow-2xl lg:shadow-none`}>
            
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center lg:hidden mb-2">
              <h3 className="font-serif text-xl text-zinc-900">Filtros</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorías */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <h4 className="text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-6">Categorías</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/catalog"
                    className={`text-sm ${type === 'all' ? 'text-store-primary font-bold' : 'text-zinc-500 hover:text-store-primary'} transition-colors`}
                  >
                    Todo
                  </Link>
                </li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className={`text-sm ${categorySlug === cat.slug ? 'text-store-primary font-bold' : 'text-zinc-500 hover:text-store-primary'} transition-colors`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colecciones */}
            {collections && collections.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <h4 className="text-[13px] font-bold text-zinc-900 uppercase tracking-widest mb-6">Colecciones</h4>
                <ul className="space-y-4">
                  {collections.map(col => (
                    <li key={col.id}>
                      <Link
                        to={`/collection/${col.slug}`}
                        className={`text-sm ${collectionSlug === col.slug ? 'text-store-primary font-bold' : 'text-zinc-500 hover:text-store-primary'} transition-colors`}
                      >
                        {col.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Promo Box */}
            <div className="relative rounded-2xl overflow-hidden p-8 shadow-sm border border-zinc-100 bg-gradient-to-br from-store-primary/10 to-store-primary/20 hidden md:block">
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold text-store-primary uppercase tracking-widest mb-2">Nueva Colección</h4>
                <h4 className="text-xl font-serif text-zinc-900 mb-3 leading-tight">Gala Invierno 2026</h4>
                <p className="text-xs text-zinc-600 mb-6 leading-relaxed">Diseños que te acompañan en tus momentos más especiales.</p>
                <Link to="/collection/gala-invierno-2026" className="inline-block bg-store-primary hover:bg-store-primary/90 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full border border-transparent transition-colors shadow-md">
                  Ver Colección
                </Link>
              </div>
            </div>

          </aside>

          {/* RIGHT CONTENT (PRODUCTS) */}
          <main className="flex-1">

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-store-primary transition-colors px-4 py-2 rounded-lg bg-white border border-zinc-100 shadow-sm hover:shadow-md lg:hidden"
              >
                <Filter className="w-4 h-4" />
                FILTRAR
              </button>
              
              {/* Spacer on Desktop */}
              <div className="hidden lg:block"></div>

              <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm font-bold text-store-primary bg-store-primary/10 hover:bg-store-primary/20 px-4 py-2 rounded-lg transition-colors"
                >
                  {sortBy === 'newest' ? 'MÁS RECIENTES' : sortBy === 'price_asc' ? 'MENOR PRECIO' : 'MAYOR PRECIO'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-xl overflow-hidden py-2 z-20">
                    <button onClick={() => { setSortBy('newest'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'newest' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Más Recientes</button>
                    <button onClick={() => { setSortBy('price_asc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'price_asc' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Precio: Menor a Mayor</button>
                    <button onClick={() => { setSortBy('price_desc'); setIsSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm ${sortBy === 'price_desc' ? 'text-store-primary font-bold bg-store-primary/5' : 'text-zinc-600 hover:bg-zinc-50'}`}>Precio: Mayor a Menor</button>
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-store-primary" /></div>
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                  {visibleProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Cargar Más */}
                {visibleCount < processedProducts.length && (
                  <div className="flex justify-center border-t border-zinc-200 pt-12">
                    <button 
                      onClick={() => setVisibleCount(v => v + 6)}
                      className="flex items-center justify-center gap-2 bg-store-primary/80 hover:bg-store-primary text-white text-[11px] font-bold uppercase tracking-widest px-10 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      <Heart className="w-4 h-4" /> Cargar Más
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-100">
                <p className="text-zinc-500 mb-4">No se encontraron productos en esta sección.</p>
                <Link to="/catalog" className="text-sm font-bold text-store-primary underline hover:opacity-80 transition-opacity">Volver al catálogo completo</Link>
              </div>
            )}

            {/* Features Bar */}
            <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center flex flex-col items-center">
                <ShieldCheck className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Diseños Exclusivos</h5>
                <p className="text-[11px] text-zinc-500">Colecciones únicas y limitadas</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Award className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Calidad Premium</h5>
                <p className="text-[11px] text-zinc-500">Materiales y acabados de lujo</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Truck className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Envíos Seguros</h5>
                <p className="text-[11px] text-zinc-500">A todo el país</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <Headset className="w-8 h-8 text-store-primary/80 mb-3" strokeWidth={1.5} />
                <h5 className="text-xs font-bold text-zinc-900 mb-2">Atención Personalizada</h5>
                <p className="text-[11px] text-zinc-500">Asesoría por expertas</p>
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  )
}
