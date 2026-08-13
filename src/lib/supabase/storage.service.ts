import { supabase } from '@/lib/supabase/client'

const BUCKET_NAME = 'catalogs'

export const storageService = {
  /**
   * Sube una imagen al bucket de catálogos bajo la estructura del tenant
   * path: [tenant_id]/products/[product_id]/[filename]
   */
  async uploadProductImage(
    tenantId: string, 
    productId: string, 
    file: File
  ): Promise<{ path: string, url: string }> {
    const fileExt = file.name.split('.').pop()
    const fileName = Math.random().toString(36).substring(2, 15) + '.' + fileExt
    const filePath = `${tenantId}/products/${productId}/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      path: data.path,
      url: publicUrl
    }
  },

  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])
      
    if (error) {
      throw error
    }
  }
}
