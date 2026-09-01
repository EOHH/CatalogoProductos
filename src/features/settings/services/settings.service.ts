import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import imageCompression from 'browser-image-compression'

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

  async updateTenantSlug(tenantId: string, newSlug: string): Promise<{ success: boolean, slug: string }> {
    const { data, error } = await (supabase.rpc as any)('update_tenant_slug', {
      p_tenant_id: tenantId,
      p_new_slug: newSlug
    })

    if (error) throw error
    return data as { success: boolean, slug: string }
  },

  async uploadAsset(tenantId: string, file: File, type: 'logo' | 'favicon'): Promise<string> {
    // Compresión de imagen
    let fileToUpload = file
    try {
      if (file.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 0.2, // 200KB max para logos/favicons (son pequeños)
          maxWidthOrHeight: 512,
          useWebWorker: true
        }
        fileToUpload = await imageCompression(file, options)
      }
    } catch (e) {
      console.warn('Fallo la compresión del logo/favicon, usando original', e)
    }

    // Generar un nombre de archivo único
    const ext = fileToUpload.name.split('.').pop() || 'png'
    const filename = `${type}-${Date.now()}.${ext}`
    const path = `${tenantId}/${filename}`

    const { error } = await supabase.storage
      .from('tenant-assets')
      .upload(path, fileToUpload, {
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
