import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useStore } from '../providers/StoreProvider'

export function useStoreRealtime() {
  const { tenant } = useStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!tenant) return

    const tenantId = tenant.id

    // Helper para refrescar todo el catálogo desde el RPC maestro
    const refreshCatalog = async (source: string) => {
      console.log(`Realtime: ${source} changed. Refetching master catalog...`)
      // 1. Forzar refetch del query maestro para actualizar el 'cachedCatalog' en memoria
      await queryClient.refetchQueries({ queryKey: ['public-tenant'] })
      // 2. Invalidar todos los queries derivados para que lean la nueva memoria caché
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-new-products'] })
      queryClient.invalidateQueries({ queryKey: ['public-product'] })
      queryClient.invalidateQueries({ queryKey: ['public-categories'] })
      queryClient.invalidateQueries({ queryKey: ['public-collections'] })
    }

    // Suscribirse a los cambios de las tablas principales que afectan la tienda pública
    const channel = supabase.channel(`storefront-realtime-${tenantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refreshCatalog('products'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => refreshCatalog('categories'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collections' }, () => refreshCatalog('collections'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, () => refreshCatalog('product_images'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_variants' }, () => refreshCatalog('product_variants'))
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenant, queryClient])
}
