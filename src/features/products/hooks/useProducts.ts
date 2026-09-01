import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService } from '../services/products.service'
import type { CreateProductPayload, CreateVariantPayload, UpdateProductPayload, UpdateVariantPayload, UpdateImageKeep } from '../services/products.service'
import { useTenant } from '@/features/core/TenantProvider'
import { toast } from 'sonner'

export function useProducts() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const tenantId = tenant?.id

  const query = useQuery({
    queryKey: ['products', tenantId],
    queryFn: () => productsService.getProducts(tenantId!),
    enabled: !!tenantId
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      product: CreateProductPayload,
      collectionIds: string[],
      variants: CreateVariantPayload[],
      imageFiles: File[]
    }) => {
      return productsService.createProduct(
        tenantId!,
        data.product,
        data.collectionIds,
        data.variants,
        data.imageFiles
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      toast.success('Producto creado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al crear producto: ' + error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: {
      productId: string
      product: UpdateProductPayload
      collectionIds: string[]
      variants: UpdateVariantPayload[]
      imagesToDelete: string[]
      imagesToKeep: UpdateImageKeep[]
      newImageFiles: File[]
    }) => {
      return productsService.updateProduct(
        tenantId!,
        data.productId,
        data.product,
        data.collectionIds,
        data.variants,
        data.imagesToDelete,
        data.imagesToKeep,
        data.newImageFiles
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      toast.success('Producto actualizado exitosamente')
    },
    onError: () => {
      // Error is caught and toasted by the view layer
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return productsService.deleteProduct(id, tenantId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      toast.success('Producto eliminado exitosamente')
    },
    onError: (error: any) => {
      toast.error('Error al eliminar producto: ' + error.message)
    }
  })

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

