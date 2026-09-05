import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { catalogService } from '../services/catalog.service'
import type { Database } from '@/types/database.types'
import { Loader2 } from 'lucide-react'

type Tenant = Database['public']['Tables']['tenants']['Row']
type TenantSettings = Database['public']['Tables']['tenant_settings']['Row']

interface StoreContextType {
  tenant: Tenant | null
  settings: TenantSettings | null
  isLoading: boolean
  error: Error | null
}

const StoreContext = createContext<StoreContextType>({
  tenant: null,
  settings: null,
  isLoading: true,
  error: null
})

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-tenant', window.location.hostname],
    queryFn: async () => {
      const hostname = window.location.hostname
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      
      // En desarrollo local (localhost), pasamos null para que la BD nos devuelva la primera tienda por defecto
      // Si estamos en un dominio real (como www.mitienda.com o mitienda.misitio.com), 
      // limpiamos el "www." y pasamos el host completo para buscar en slug o custom_domain
      const cleanHostname = isLocalhost ? null : hostname.replace(/^www\./, '')
      
      const tenantData = await catalogService.getTenantByHostname(cleanHostname)
      
      if (!tenantData) {
        throw new Error('Tenant not found')
      }

      // Hack para tipado
      const dataObj = tenantData as any
      let settings = dataObj.tenant_settings
      if (Array.isArray(settings)) {
         settings = settings[0]
      }
      
      return {
        tenant: tenantData as Tenant,
        settings: settings as TenantSettings
      }
    },
    staleTime: 1000 * 60 * 30 // Cache por 30 mins, rara vez cambia
  })

  // Efecto para inyectar colores y fuentes dinámicas
  useEffect(() => {
    if (data?.tenant) {
      const root = document.documentElement
      
      // Inyectar primary color para el storefront
      if (data.tenant.primary_color) {
        root.style.setProperty('--store-primary-color', data.tenant.primary_color)
      } else {
        root.style.setProperty('--store-primary-color', '#000000') // Default
      }

      // Inyectar favicon (si existe)
      if (data.tenant.favicon_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = data.tenant.favicon_url
      }
      
      // Inyectar metadatos (Title)
      if (data.settings?.store_name) {
        document.title = data.settings.store_name
      } else if (data.tenant.name) {
        document.title = data.tenant.name
      }
    }
  }, [data?.tenant, data?.settings])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (error || !data?.tenant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 p-4">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Tienda no encontrada</h1>
        <p className="text-muted-foreground">La tienda que intentas visitar no existe o está suspendida.</p>
      </div>
    )
  }



  const value = {
    tenant: data.tenant,
    settings: data.settings,
    isLoading,
    error
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
