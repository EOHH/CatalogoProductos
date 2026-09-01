import { supabase } from '@/lib/supabase/client'
import type { PublicProduct, PublicCategory, PublicCollection, PublicTenant, PublicSettings } from '@/types/catalog'

export interface CatalogData {
  tenant: PublicTenant
  settings: PublicSettings
  categories: PublicCategory[]
  collections: PublicCollection[]
  products: PublicProduct[]
}

// Cache en memoria para evitar llamadas redundantes a RPC
let cachedCatalog: CatalogData | null = null

export const catalogService = {
  // 1. Get active tenant via RPC get_public_catalog
  async getTenantByHostname(hostname: string | null) {
    if (!hostname) hostname = window.location.hostname
    const cleanHostname = hostname.replace(/^www\./, '')
    
    const isLocalhost = cleanHostname === 'localhost' || cleanHostname === '127.0.0.1'
    const configuredSharedDomain = import.meta.env.VITE_SHARED_DOMAIN as string | undefined
    
    // Consideramos "dominio compartido" a localhost, *.vercel.app, o un dominio principal SaaS
    const isSharedDomain = isLocalhost || 
                           cleanHostname.endsWith('.vercel.app') || 
                           (configuredSharedDomain && cleanHostname === configuredSharedDomain)

    let p_slug = cleanHostname

    if (isSharedDomain) {
      const pathSegment = window.location.pathname.split('/')[1]
      const reservedRoutes = ['login', 'register', 'dashboard', 'catalog', 'category', 'collection', 'product', 'wishlist']
      
      if (pathSegment && !reservedRoutes.includes(pathSegment)) {
        p_slug = pathSegment
      } else if (isLocalhost) {
        p_slug = (import.meta.env.VITE_DEFAULT_TENANT_SLUG as string) || 'demo'
      } else {
        p_slug = 'demo'
      }
    } else {
      // Para dominios personalizados, el slug de búsqueda es el propio dominio.
      // get_public_catalog evalúa: slug = p_slug OR custom_domain = p_slug
      p_slug = cleanHostname
    }

    // @ts-expect-error: LIMITACIÓN - @supabase/postgrest-js ^2.x evalúa 'Args' a 'never' por exceder el límite de profundidad de instanciación del compilador TS al parsear el Schema global generado, asumiendo erróneamente que la función no toma argumentos.
    const { data, error } = await supabase.rpc('get_public_catalog', { p_slug })
    if (error) throw error
    if (!data) throw new Error('Tenant not found')

    // Casting explícito del Json devuelto por la RPC hacia nuestro DTO tipado
    cachedCatalog = data as unknown as CatalogData

    // Simulamos la estructura antigua para que StoreProvider no se rompa
    return {
      ...cachedCatalog!.tenant,
      tenant_settings: cachedCatalog!.settings
    }
  },

  async getCategories(_tenantId: string): Promise<PublicCategory[]> {
    if (cachedCatalog) return cachedCatalog.categories
    return []
  },

  async getCollections(_tenantId: string): Promise<PublicCollection[]> {
    if (cachedCatalog) return cachedCatalog.collections
    return []
  },

  async getFeaturedProducts(_tenantId: string): Promise<PublicProduct[]> {
    if (cachedCatalog) {
      return cachedCatalog.products
        .filter(p => p.featured)
        .slice(0, 8)
    }
    return []
  },

  async getNewProducts(_tenantId: string): Promise<PublicProduct[]> {
    if (cachedCatalog) {
      return [...cachedCatalog.products]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
    }
    return []
  },

  async getProducts(_tenantId: string, categorySlug?: string, collectionSlug?: string, searchQuery?: string): Promise<PublicProduct[]> {
    if (!cachedCatalog) return []

    let products = cachedCatalog.products

    if (categorySlug) {
      // INCOMPATIBILIDAD: El RPC solo devuelve category_id en el producto, no un inner join con el slug.
      // Buscamos la categoría en la lista cachead para obtener el ID.
      const cat = cachedCatalog.categories.find(c => c.slug === categorySlug)
      if (cat) {
        products = products.filter(p => p.category_id === cat.id)
      } else {
        products = []
      }
    }

    if (collectionSlug) {
      // INCOMPATIBILIDAD: El RPC devuelve product_ids dentro de la colección.
      const coll = cachedCatalog.collections.find(c => c.slug === collectionSlug)
      if (coll && (coll as any).product_ids) {
        products = products.filter(p => (coll as any).product_ids.includes(p.id))
      } else {
        products = []
      }
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      products = products.filter(p => p.name.toLowerCase().includes(term))
    }

    return products
  },

  async searchProducts(_tenantId: string, queryTerm: string): Promise<PublicProduct[]> {
    if (!cachedCatalog || !queryTerm || queryTerm.length < 2) return []
    const term = queryTerm.toLowerCase()
    return cachedCatalog.products
      .filter(p => p.name.toLowerCase().includes(term))
      .slice(0, 5)
  },

  async getProductBySlug(_tenantId: string, slug: string) {
    if (!cachedCatalog) return null
    const product = cachedCatalog.products.find(p => p.slug === slug)
    if (!product) return null

    // INCOMPATIBILIDAD: El código antiguo esperaba categories(*) anidado.
    // Lo hidratamos manualmente desde cache:
    const category = cachedCatalog.categories.find(c => c.id === product.category_id)
    return {
      ...product,
      categories: category || null
    }
  }
}
