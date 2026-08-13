import { supabase } from '@/lib/supabase/client'
import type { Collection } from '@/types/catalog'

export const collectionsService = {
  async getCollections(tenantId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('position', { ascending: true })

    if (error) throw error
    return data as Collection[]
  },

  async createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection as any)
      .select()
      .single()

    if (error) throw error
    return data as Collection
  },

  async updateCollection(id: string, tenantId: string, updates: Partial<Collection>): Promise<Collection> {
    const { data, error } = await supabase
      .from('collections')
      .update(updates as never)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data as Collection
  },

  async deleteCollection(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) throw error
  }
}

