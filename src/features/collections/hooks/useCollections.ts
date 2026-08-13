import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '../services/collections.service'
import { useTenant } from '@/features/core/TenantProvider'
import { toast } from 'sonner'
import type { Collection } from '@/types/catalog'

export function useCollections() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const tenantId = tenant?.id

  const query = useQuery({
    queryKey: ['collections', tenantId],
    queryFn: () => collectionsService.getCollections(tenantId!),
    enabled: !!tenantId
  })

  const createMutation = useMutation({
    mutationFn: (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
      return collectionsService.createCollection({ ...collection, tenant_id: tenantId! })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', tenantId] })
      toast.success('Colección creada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al crear colección: ' + error.message)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Collection> }) => {
      return collectionsService.updateCollection(id, tenantId!, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', tenantId] })
      toast.success('Colección actualizada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al actualizar colección: ' + error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return collectionsService.deleteCollection(id, tenantId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', tenantId] })
      toast.success('Colección eliminada exitosamente')
    },
    onError: (error) => {
      toast.error('Error al eliminar colección: ' + error.message)
    }
  })

  return {
    collections: query.data || [],
    isLoading: query.isLoading,
    createCollection: createMutation.mutateAsync,
    updateCollection: updateMutation.mutateAsync,
    deleteCollection: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
