export interface Category {
  id: string
  tenant_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Collection {
  id: string
  tenant_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  status: 'published' | 'draft' | 'archived'
  featured: boolean
  position: number
  tags?: string[] | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  tenant_id: string
  product_id: string
  storage_path: string
  public_url: string
  alt_text: string | null
  position: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  tenant_id: string
  product_id: string
  name: string
  sku: string | null
  price: number | null
  stock: number
  created_at: string
  updated_at: string
}

// ==========================================
// PUBLIC DTOs (Data Transfer Objects)
// ==========================================
// Tipos específicos para la respuesta de get_public_catalog().
// Solo exponen la información estrictamente necesaria para el storefront.

export interface PublicCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
}

export interface PublicCollection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
  product_ids: string[]
}

export interface PublicProductImage {
  id: string
  public_url: string
  alt_text: string | null
  position: number
  is_primary: boolean
}

export interface PublicProductVariant {
  id: string
  name: string
  sku: string | null
  price: number | null
  stock: number
}

export interface PublicProduct {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  featured: boolean
  position: number
  tags?: string[] | null
  created_at: string
  images: PublicProductImage[]
  variants: PublicProductVariant[]
  categories?: PublicCategory | null
}

export interface PublicTenant {
  id: string
  name: string
  slug: string
  custom_domain: string | null
  status: 'active' | 'inactive' | 'suspended'
  logo_url: string | null
  favicon_url: string | null
  primary_color: string | null
  secondary_color: string | null
  created_at: string
  updated_at: string
}

export interface PublicSettings {
  id: string
  tenant_id: string
  store_name: string
  description: string | null
  contact_email: string | null
  phone: string | null
  address: string | null
  currency: string
  locale: string
  timezone: string
  created_at: string
  updated_at: string
}
