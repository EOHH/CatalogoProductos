import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Loader2 } from 'lucide-react'
import { useStore } from '../providers/StoreProvider'
import { catalogService } from '../services/catalog.service'
import { useDebounce } from '../../../hooks/useDebounce'

interface SearchPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const { tenant } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchTerm('')
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', tenant?.id, debouncedSearchTerm],
    queryFn: () => catalogService.searchProducts(tenant!.id, debouncedSearchTerm),
    enabled: !!tenant?.id && debouncedSearchTerm.length > 1
  })

  if (!isOpen) return null

  const handleProductClick = (slug: string) => {
    onClose()
    navigate(`/product/${slug}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-zinc-900/80 backdrop-blur-sm fade-in">
      {/* Background click area to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-zinc-100">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 w-full bg-transparent border-0 outline-none px-4 py-5 text-zinc-900 placeholder-zinc-400 font-medium text-lg"
            placeholder="Buscar vestidos, faldas, colecciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
            </div>
          )}

          {!isLoading && debouncedSearchTerm.length > 1 && results?.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              No encontramos resultados para "{searchTerm}"
            </div>
          )}

          {!isLoading && results && results.length > 0 && (
            <div className="p-2">
              <h3 className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Productos
              </h3>
              <div className="flex flex-col">
                {results.map((product) => {
                  // @ts-ignore
                  const image = product.product_images?.find(i => i.is_primary)?.public_url || product.product_images?.[0]?.public_url
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 transition-colors text-left group"
                    >
                      <div className="w-12 h-16 bg-zinc-100 overflow-hidden shrink-0">
                        {image ? (
                          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-zinc-200" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-zinc-900">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-zinc-900">
                            S/ {Number(product.price).toFixed(2)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-[10px] text-zinc-400 line-through">
                              S/ {Number(product.compare_at_price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="border-t border-zinc-100 mt-2 p-2">
                <button
                  onClick={() => {
                    onClose()
                    navigate(`/catalog`)
                  }}
                  className="w-full py-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors text-center"
                >
                  Ver todo el catálogo
                </button>
              </div>
            </div>
          )}

          {!searchTerm && (
            <div className="p-8 text-center text-zinc-400 text-sm">
              Escribe el nombre de un producto para comenzar a buscar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
