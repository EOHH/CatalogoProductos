import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantSettings = Database['public']['Tables']['tenant_settings']['Row']

export const settingsService = {
  async updateTenant(tenantId: string, updates: Database['public']['Tables']['tenants']['Update']): Promise<Tenant> {
    const { data, error } = await (supabase.from('tenants') as any)
      .update(updates)
      .eq('id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data as Tenant
  },

  async updateTenantSettings(tenantId: string, updates: Database['public']['Tables']['tenant_settings']['Update']): Promise<TenantSettings> {
    const { data, error } = await (supabase.from('tenant_settings') as any)
      .update(updates)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data as TenantSettings
  },

  async uploadAsset(tenantId: string, file: File, type: 'logo' | 'favicon'): Promise<string> {
    // Generar un nombre de archivo único
    const ext = file.name.split('.').pop()
    const filename = `${type}-${Date.now()}.${ext}`
    const path = `${tenantId}/${filename}`

    const { data, error } = await supabase.storage
      .from('tenant-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('tenant-assets')
      .getPublicUrl(path)

    return publicUrl
  }
}
