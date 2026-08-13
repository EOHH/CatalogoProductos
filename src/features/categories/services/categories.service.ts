import { supabase } from '@/lib/supabase/client'
import type { Category } from '@/types/catalog'

export const categoriesService = {
  async getCategories(tenantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true })

    if (error) throw error
    return data as Category[]
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category as any)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async updateCategory(id: string, tenantId: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates as never)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async deleteCategory(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) throw error
  }
}

