import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, UploadCloud, Plus, Trash2 } from 'lucide-react'
import { useCategories } from '../../categories/hooks/useCategories'
import { useCollections } from '../../collections/hooks/useCollections'
import type { CreateProductPayload, CreateVariantPayload } from '../services/products.service'

const variantSchema = z.object({
  name: z.string().min(1, 'El nombre de variante es requerido'),
  sku: z.string().optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number()
})

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  compare_at_price: z.coerce.number().optional(),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  status: z.enum(['published', 'draft', 'archived']),
  featured: z.boolean(),
  position: z.coerce.number(),
  collectionIds: z.array(z.string()),
  variants: z.array(variantSchema)
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  onSuccess: (data: {
    product: CreateProductPayload
    collectionIds: string[]
    variants: CreateVariantPayload[]
    imageFiles: File[]
  }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProductForm({ onSuccess, onCancel, isSubmitting }: ProductFormProps) {
  const { categories } = useCategories()
  const { collections } = useCollections()
  const [imageFiles, setImageFiles] = useState<File[]>([])
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'draft',
      featured: false,
      position: 0,
      collectionIds: [],
      variants: []
    }
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    setValue('slug', name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleCollection = (collectionId: string) => {
    const current = watch('collectionIds') || []
    if (current.includes(collectionId)) {
      setValue('collectionIds', current.filter(id => id !== collectionId))
    } else {
      setValue('collectionIds', [...current, collectionId])
    }
  }

  const submitForm = async (data: ProductFormValues) => {
    const productPayload: CreateProductPayload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      short_description: data.short_description || null,
      sku: data.sku || null,
      price: data.price,
      compare_at_price: data.compare_at_price || null,
      category_id: data.category_id,
      status: data.status,
      featured: data.featured,
      position: data.position
    }

    const variantsPayload: CreateVariantPayload[] = data.variants.map(v => ({
      name: v.name,
      sku: v.sku || null,
      price: v.price || null,
      stock: v.stock
    }))

    await onSuccess({
      product: productPayload,
      collectionIds: data.collectionIds,
      variants: variantsPayload,
      imageFiles: imageFiles
    })
  }

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-8 animate-in fade-in duration-700 font-sans pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 py-4 border-b border-zinc-100">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Nuevo Producto</h2>
          <p className="text-sm text-zinc-500">Crea un producto asombroso para tu catálogo.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm">
            {isSubmitting ? 'Guardando...' : 'Crear Producto'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900">Información General</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Nombre del Producto</label>
                <Input {...register('name')} onChange={handleNameChange} className="bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Ej. Zapatillas Nike Air" />
                {errors.name && <p className="text-rose-500 text-xs">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Slug URL</label>
                <Input {...register('slug')} className="bg-zinc-50 border-zinc-200 rounded-xl text-zinc-500" placeholder="zapatillas-nike-air" />
                {errors.slug && <p className="text-rose-500 text-xs">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Descripción Corta</label>
              <Input {...register('short_description')} className="bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Un resumen atractivo del producto..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Descripción Detallada</label>
              <textarea 
                {...register('description')} 
                className="w-full min-h-[120px] p-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Escribe todo el detalle de tu producto..."
              />
            </div>
          </Card>

          <Card className="p-6 rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900">Imágenes</h3>
            
            <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:bg-zinc-50 transition-colors relative">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-900">Arrastra imágenes o haz clic para subir</p>
              <p className="text-xs text-zinc-500 mt-1">PNG, JPG o WEBP (Max. 5MB)</p>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 text-rose-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/80 text-white text-[10px] rounded-md font-medium">Principal</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Variantes</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ name: '', stock: 0, sku: '', price: undefined })} className="rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Variante
              </Button>
            </div>
            
            {variantFields.length === 0 ? (
              <div className="text-center py-8 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-sm text-zinc-500">Este producto no tiene variantes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100 relative group">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700">Nombre (Ej: XL Rojo)</label>
                        <Input {...register(`variants.${index}.name`)} className="bg-white text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700">SKU (Opcional)</label>
                        <Input {...register(`variants.${index}.sku`)} className="bg-white text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700">Precio (Opcional)</label>
                        <Input type="number" {...register(`variants.${index}.price`)} className="bg-white text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-700">Stock</label>
                        <Input type="number" {...register(`variants.${index}.stock`)} className="bg-white text-sm h-9" />
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)} className="mt-5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="p-6 rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900">Precios e Inventario</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Precio Regular *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">S/</span>
                  <Input type="number" step="0.01" {...register('price')} className="pl-7 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="0.00" />
                </div>
                {errors.price && <p className="text-rose-500 text-xs">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Precio de Comparación</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">S/</span>
                  <Input type="number" step="0.01" {...register('compare_at_price')} className="pl-7 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="0.00" />
                </div>
                <p className="text-xs text-zinc-500">Se mostrará tachado para indicar un descuento.</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-zinc-900">SKU Global</label>
                <Input {...register('sku')} className="bg-zinc-50 border-zinc-200 rounded-xl" placeholder="PROD-001" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900">Clasificación</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Estado</label>
                <select {...register('status')} className="w-full p-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Categoría Principal *</label>
                <select {...register('category_id')} className="w-full p-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <option value="">Selecciona una categoría</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-rose-500 text-xs">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium text-zinc-900">Colecciones</label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                  {collections?.length === 0 && <p className="text-xs text-zinc-500">No hay colecciones creadas.</p>}
                  {collections?.map(c => (
                    <div key={c.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`col-${c.id}`}
                        checked={(watch('collectionIds') || []).includes(c.id)}
                        onChange={() => toggleCollection(c.id)}
                        className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4" 
                      />
                      <label htmlFor={`col-${c.id}`} className="text-sm text-zinc-700 cursor-pointer">{c.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="featured" {...register('featured')} className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4" />
                  <label htmlFor="featured" className="text-sm font-medium text-zinc-900">
                    Producto Destacado
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}

