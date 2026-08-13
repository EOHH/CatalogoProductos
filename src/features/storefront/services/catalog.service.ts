import { supabase } from '@/lib/supabase/client'
import type { Product, Category, Collection } from '@/types/catalog'

// Force TS server reload
export const catalogService = {
  // Get active tenant for public viewing
  async getTenantByHostname(hostname: string | null) {
    let query = supabase.from('tenants').select('*, tenant_settings(*)').eq('status', 'active')
    
    if (hostname) {
      // Usar un filtro 'or' para buscar por slug O por custom_domain
      // Si el hostname es "mi-tienda", buscará slug = "mi-tienda" o custom_domain = "mi-tienda"
      // Si el hostname es "cliente-a.com", buscará slug = "cliente-a.com" o custom_domain = "cliente-a.com"
      query = query.or(`slug.eq.${hostname},custom_domain.eq.${hostname}`)
    } else {
      // For local development fallback to first active tenant
      query = query.limit(1)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return data
  },

  async getCategories(tenantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('position', { ascending: true })

    if (error) throw error
    return data as Category[]
  },

  async getCollections(tenantId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('position', { ascending: true })

    if (error) throw error
    return data as Collection[]
  },

  async getFeaturedProducts(tenantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .eq('featured', true)
      .order('position', { ascending: true })
      .limit(8)

    if (error) throw error
    return data as Product[]
  },

  async getNewProducts(tenantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return data as Product[]
  },

  async getProducts(tenantId: string, categorySlug?: string, collectionSlug?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*, product_images(*), categories!inner(*)')
      .eq('tenant_id', tenantId)
      .eq('status', 'published')

    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug)
    }

    // Note: To filter by collection we need a slightly more complex query in Supabase.
    // We'll filter products by getting those that are in the product_collections table for that collection.
    if (collectionSlug) {
      const { data: coll } = await supabase
        .from('collections')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('slug', collectionSlug)
        .single()
      
      if (coll) {
        // Query products that have a product_collections row with this collection_id
        const { data: pc } = await supabase.from('product_collections').select('product_id').eq('collection_id', (coll as any).id)
        if (pc && pc.length > 0) {
          query = query.in('id', pc.map((p: any) => p.product_id))
        } else {
          return []
        }
      } else {
        return []
      }
    }

    const { data, error } = await query.order('position', { ascending: true }).order('created_at', { ascending: false })
    if (error) throw error
    return data as Product[]
  },

  async searchProducts(tenantId: string, queryTerm: string): Promise<Product[]> {
    if (!queryTerm || queryTerm.length < 2) return []

    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('tenant_id', tenantId)
      .eq('status', 'published')
      .ilike('name', `%${queryTerm}%`)
      .limit(5)

    if (error) throw error
    return data as Product[]
  },

  async getProductBySlug(tenantId: string, slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), categories(*)')
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) throw error
    return data
  }
}
