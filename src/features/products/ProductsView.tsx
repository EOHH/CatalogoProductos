import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProducts } from './hooks/useProducts'
import { useCategories } from '../categories/hooks/useCategories'
import { Plus, Search, Pencil, Trash2, Box, Image as ImageIcon, Filter } from 'lucide-react'
import { ProductForm } from './components/ProductForm'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function ProductsView() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct, isCreating, isUpdating } = useProducts()
  const { categories } = useCategories()
  
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Scroll to top when viewState changes
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container')
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [viewState])
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleCreateSuccess = async (data: any) => {
    await createProduct(data)
    setViewState('list')
  }

  const handleEditSuccess = async (data: any) => {
    try {
      await updateProduct({ 
        productId: editingProduct.id,
        product: data.product,
        collectionIds: data.collectionIds || [],
        variants: data.variants || [],
        imagesToDelete: data.imagesToDelete || [],
        imagesToKeep: data.imagesToKeep || [],
        newImageFiles: data.imageFiles || []
      })
      setViewState('list')
      setEditingProduct(null)
    } catch (error) {
      console.error('Error interno al actualizar producto:', error)
      toast.error('No se pudo actualizar el producto. Inténtalo nuevamente.')
    }
  }

  if (viewState === 'create' || viewState === 'edit') {
    return (
      <ProductForm 
        initialData={viewState === 'edit' ? editingProduct : undefined}
        onSuccess={viewState === 'edit' ? handleEditSuccess : handleCreateSuccess} 
        onCancel={() => {
          setViewState('list')
          setEditingProduct(null)
        }} 
        isSubmitting={viewState === 'edit' ? isUpdating : isCreating}
      />
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Productos</h1>
          <p className="text-[15px] text-muted-foreground mt-1">
            Gestiona todo el catálogo de tu tienda
          </p>
        </div>
        <Button onClick={() => setViewState('create')} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-2.5 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="rounded-[1.5rem] bg-card border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
        {/* Toolbar: Search and Filters */}
        <div className="p-4 md:p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-card">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-xl h-10 text-foreground"
            />
          </div>

          <div className="flex flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 appearance-none h-10 min-w-[140px] cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
                <option value="archived">Archivados</option>
              </select>
            </div>

            <div className="relative group">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-4 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-none rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 appearance-none h-10 min-w-[160px] cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider pl-6 w-16">Imagen</TableHead>
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider min-w-[200px]">Producto</TableHead>
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Categoría</TableHead>
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">Precio</TableHead>
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider text-center">Estado</TableHead>
                <TableHead className="font-medium text-muted-foreground text-xs uppercase tracking-wider text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                      <p>Cargando catálogo...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Box className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                      <p className="text-foreground font-medium">No se encontraron productos</p>
                      <p className="text-sm mt-1">Prueba cambiando los filtros de búsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => {
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]
                  const category = categories.find((c: any) => c.id === product.category_id)
                  
                  return (
                    <TableRow key={product.id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                          {primaryImage ? (
                            <img src={primaryImage.public_url} alt={product.name} className="w-full h-full object-cover transition-transform hover:scale-110" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground py-4">
                        <div className="flex flex-col">
                          <span className="text-[15px]">{product.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{product.sku || 'Sin SKU'}</span>
                            {product.featured && (
                              <span className="text-[9px] uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold">Destacado</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4 text-sm">
                        {category?.name || <span className="italic opacity-50">Sin categoría</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground py-4">
                        <span className="tabular-nums">S/ {Number(product.price).toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          product.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          product.status === 'draft' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' :
                          'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                          {product.status === 'published' ? 'Publicado' :
                           product.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setEditingProduct(product)
                              setViewState('edit')
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirm(product.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteProduct(deleteConfirm)
            setDeleteConfirm(null)
          }
        }}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto completamente? Esta acción borrará todas sus imágenes y variantes. No se puede deshacer."
      />
    </div>
  )
}

