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
