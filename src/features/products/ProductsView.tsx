import { useState } from 'react'
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
      toast.error('No se pudo actualizar el producto. IntÃ©ntalo nuevamente.')
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Productos</h1>
          <p className="text-[15px] text-zinc-500 mt-1">
            Gestiona todo el catÃ¡logo de tu tienda
          </p>
        </div>
        <Button onClick={() => setViewState('create')} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-2.5 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
        {/* Toolbar: Search and Filters */}
        <div className="p-4 md:p-6 border-b border-zinc-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Buscar por nombre o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-50 border-none rounded-xl h-10"
            />
          </div>

          <div className="flex flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 bg-zinc-50 border-none rounded-xl text-sm text-zinc-600 outline-none focus:ring-2 focus:ring-primary/20 appearance-none h-10 min-w-[140px] cursor-pointer"
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
                className="pl-4 pr-8 py-2 bg-zinc-50 border-none rounded-xl text-sm text-zinc-600 outline-none focus:ring-2 focus:ring-primary/20 appearance-none h-10 min-w-[160px] cursor-pointer"
              >
                <option value="all">Todas las categorÃ­as</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-100 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider pl-6 w-16">Imagen</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider min-w-[200px]">Producto</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider">CategorÃ­a</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider text-right">Precio</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider text-center">Estado</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                      <p>Cargando catÃ¡logo...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Box className="w-12 h-12 mb-3 text-zinc-300" />
                      <p className="text-zinc-600 font-medium">No se encontraron productos</p>
                      <p className="text-sm mt-1">Prueba cambiando los filtros de bÃºsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: any) => {
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0]
                  const category = categories.find((c: any) => c.id === product.category_id)
                  
                  return (
                    <TableRow key={product.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
                          {primaryImage ? (
                            <img src={primaryImage.public_url} alt={product.name} className="w-full h-full object-cover transition-transform hover:scale-110" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-zinc-900 py-4">
                        <div className="flex flex-col">
                          <span className="text-[15px]">{product.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-zinc-500">{product.sku || 'Sin SKU'}</span>
                            {product.featured && (
                              <span className="text-[9px] uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-bold">Destacado</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 py-4 text-sm">
                        {category?.name || '-'}
                      </TableCell>
                      <TableCell className="text-zinc-900 py-4 text-right font-semibold">
                        S/ {Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <span className={"inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium " + 
                          (product.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                           product.status === 'draft' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200')
                        }>
                          {product.status === 'published' ? 'Publicado' : product.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingProduct(product)
                            setViewState('edit')
                          }} className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(product.id)} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-zinc-500 hover:text-rose-600">
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

