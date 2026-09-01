import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useGlobalRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Escuchar todos los eventos de la base de datos (INSERT, UPDATE, DELETE) en schema public
    const channel = supabase
      .channel('global-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table

          // Mapeo inteligente de tablas a llaves de caché de React Query.
          // Invalida solo lo necesario para mantener un alto rendimiento.
          
          if (['tenants', 'tenant_settings'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
            queryClient.invalidateQueries({ queryKey: ['public-tenant'] })
          }
          
          if (['products', 'product_variants', 'product_images'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['public-catalog'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] }) // Stock y demás impactan métricas
          }

          if (['categories', 'collections', 'product_collections'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            queryClient.invalidateQueries({ queryKey: ['collections'] })
            queryClient.invalidateQueries({ queryKey: ['public-catalog'] })
          }

          if (['orders', 'order_items'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
            queryClient.invalidateQueries({ queryKey: ['customers'] }) // Pedidos pueden afectar las métricas del cliente
          }

          if (['customers'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
          }

          if (['profiles'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
            queryClient.invalidateQueries({ queryKey: ['profiles'] })
          }

          if (['activity_log'].includes(table)) {
            queryClient.invalidateQueries({ queryKey: ['activity-log'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
          }
        }
      )
      .subscribe()

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
