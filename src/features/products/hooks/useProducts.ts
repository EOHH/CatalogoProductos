import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService } from '../services/products.service'
import type { CreateProductPayload, CreateVariantPayload } from '../services/products.service'
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
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

