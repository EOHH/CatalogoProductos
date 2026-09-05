import { useEffect } from 'react'
import { useTenant } from '@/features/core/TenantProvider'

export function DynamicHead() {
  const { tenant, settings } = useTenant()

  useEffect(() => {
    // Actualizar Título
    if (settings?.store_name || tenant?.name) {
      document.title = `${settings?.store_name || tenant?.name} - Panel de Administración`
    }

    // Actualizar Favicon
    const faviconUrl = tenant?.favicon_url || tenant?.logo_url
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [tenant, settings])

  return null
}
