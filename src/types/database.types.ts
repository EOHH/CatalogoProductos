export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          slug: string
          custom_domain?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          custom_domain?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          logo_url?: string | null
          favicon_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenant_settings: {
        Row: {
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
          social_instagram: string | null
          social_facebook: string | null
          social_tiktok: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          store_name: string
          description?: string | null
          contact_email?: string | null
          phone?: string | null
          address?: string | null
          currency?: string
          locale?: string
          timezone?: string
          social_instagram?: string | null
          social_facebook?: string | null
          social_tiktok?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          store_name?: string
          description?: string | null
          contact_email?: string | null
          phone?: string | null
          address?: string | null
          currency?: string
          locale?: string
          timezone?: string
          social_instagram?: string | null
          social_facebook?: string | null
          social_tiktok?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          full_name: string | null
          role: 'admin' | 'editor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          full_name?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          full_name?: string | null
          role?: 'admin' | 'editor' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
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
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          position?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
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
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          status?: 'published' | 'draft' | 'archived'
          featured?: boolean
          position?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          category_id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          status?: 'published' | 'draft' | 'archived'
          featured?: boolean
          position?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          first_name: string
          last_name: string | null
          phone: string | null
          email: string | null
          total_spent: number
          orders_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          first_name: string
          last_name?: string | null
          phone?: string | null
          email?: string | null
          total_spent?: number
          orders_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          first_name?: string
          last_name?: string | null
          phone?: string | null
          email?: string | null
          total_spent?: number
          orders_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          status: 'pending' | 'paid' | 'in_production' | 'packaging' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          customer_id: string
          status?: 'pending' | 'paid' | 'in_production' | 'packaging' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          customer_id?: string
          status?: 'pending' | 'paid' | 'in_production' | 'packaging' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_catalog: {
        Args: {
          p_slug: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
