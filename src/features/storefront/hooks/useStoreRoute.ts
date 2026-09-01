import { useParams } from 'react-router-dom'

export function useStoreRoute() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>()
  
  const buildUrl = (path: string) => {
    // Asegurar que el path inicie con '/'
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    // Si estamos navegando bajo un slug dinámico en dominio compartido o localhost,
    // inyectamos el slug para mantener el contexto del tenant.
    if (tenantSlug) {
      return `/${tenantSlug}${cleanPath === '/' ? '' : cleanPath}`
    }
    
    // Si estamos en dominio personalizado (donde el slug se resuelve por hostname
    // y la ruta es la raíz '/'), no inyectamos nada.
    return cleanPath
  }

  return { buildUrl, tenantSlug }
}
