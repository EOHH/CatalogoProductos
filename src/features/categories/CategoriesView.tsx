import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useCategories } from './hooks/useCategories'
import { Plus, Search, Pencil, Trash2, LayoutGrid } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  is_active: z.boolean(),
  position: z.coerce.number()
})

type CategoryFormValues = z.infer<typeof categorySchema>

export function CategoriesView() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_active: true,
      position: 0
    }
  })

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateSheet = () => {
    setEditingId(null)
    reset({ name: '', slug: '', description: '', is_active: true, position: 0 })
    setIsSheetOpen(true)
  }

  const openEditSheet = (category: any) => {
    setEditingId(category.id)
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
      position: category.position
    })
    setIsSheetOpen(true)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    const payload = { ...data, image_url: null, description: data.description || null }
    if (editingId) {
      await updateCategory({ id: editingId, updates: payload })
    } else {
      await createCategory(payload)
    }
    setIsSheetOpen(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    if (!editingId) {
      setValue('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Categorías</h1>
          <p className="text-[15px] text-zinc-500 mt-1">
            Gestiona la clasificación principal de tus productos
          </p>
        </div>
        <Button onClick={openCreateSheet} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 py-2.5 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva categoría
        </Button>
      </div>

      <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Buscar categorías..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-zinc-50 border-none rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-100 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider pl-6">Nombre</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider">Slug</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider text-center">Posición</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider">Estado</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs uppercase tracking-wider text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-zinc-500">
                    Cargando categorías...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <LayoutGrid className="w-10 h-10 mb-3 text-zinc-300" />
                      <p>No se encontraron categorías</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id} className="border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <TableCell className="font-medium text-zinc-900 pl-6 py-4">{category.name}</TableCell>
                    <TableCell className="text-zinc-500 py-4">{category.slug}</TableCell>
                    <TableCell className="text-zinc-500 py-4 text-center">{category.position}</TableCell>
                    <TableCell className="py-4">
                      <span className={"inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium " + (category.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500')}>
                        {category.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditSheet(category)} className="w-8 h-8 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                            deleteCategory(category.id)
                          }
                        }} className="w-8 h-8 rounded-lg hover:bg-rose-50 text-zinc-500 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l-0 shadow-2xl p-0 flex flex-col h-full">
          <div className="p-6 border-b border-zinc-100">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-zinc-900">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
              </SheetTitle>
              <SheetDescription className="text-sm text-zinc-500 mt-1">
                {editingId ? 'Modifica los datos de la categoría existente.' : 'Completa los datos para crear una nueva categoría.'}
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Nombre</label>
                <Input {...register('name')} onChange={handleNameChange} className="rounded-xl bg-zinc-50 border-zinc-200" placeholder="Ej. Camisetas" />
                {errors.name && <p className="text-rose-500 text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Slug</label>
                <Input {...register('slug')} className="rounded-xl bg-zinc-50 border-zinc-200 text-zinc-500" placeholder="camisetas" />
                {errors.slug && <p className="text-rose-500 text-xs">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Descripción (Opcional)</label>
                <Input {...register('description')} className="rounded-xl bg-zinc-50 border-zinc-200" placeholder="Breve descripción..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Posición</label>
                <Input type="number" {...register('position')} className="rounded-xl bg-zinc-50 border-zinc-200" />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="is_active" {...register('is_active')} className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4" />
                <label htmlFor="is_active" className="text-sm font-medium text-zinc-900">
                  Categoría Activa
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3 mt-auto">
              <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl">
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

