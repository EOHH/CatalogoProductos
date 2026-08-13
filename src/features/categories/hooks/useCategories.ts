import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '../services/categories.service'
import { useTenant } from '@/features/core/TenantProvider'
import { toast } from 'sonner'
import type { Category } from '@/types/catalog'

export function useCategories() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const tenantId = tenant?.id

  const query = useQuery({
    queryKey: ['categories', tenantId],
    queryFn: () => categoriesService.getCategories(tenantId!),
    enabled: !!tenantId
  })

  const createMutation = useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
      return categoriesService.createCategory({ ...category, tenant_id: tenantId! })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenantId] })
      toast.success('Categoría creada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear categoría: ' + error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Category> }) => {
      return categoriesService.updateCategory(id, tenantId!, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenantId] })
      toast.success('Categoría actualizada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar categoría: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return categoriesService.deleteCategory(id, tenantId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenantId] })
      toast.success('Categoría eliminada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al eliminar categoría: ' + error.message)
    }
  })

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
