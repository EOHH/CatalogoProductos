import { supabase } from '@/lib/supabase/client'
import { storageService } from '@/lib/supabase/storage.service'
import imageCompression from 'browser-image-compression'
import type { Product, ProductVariant } from '@/types/catalog'

export type CreateProductPayload = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>
export type CreateVariantPayload = Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'product_id'>

export const productsService = {
  async getProducts(tenantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  },

  async getProductById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_collections(collection_id)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error) throw error
    return data
  },

  async createProduct(
    tenantId: string,
    productPayload: CreateProductPayload,
    collectionIds: string[],
    variantsPayload: CreateVariantPayload[],
    imageFiles: File[]
  ) {
    // 1. Create Product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({ ...productPayload, tenant_id: tenantId } as any)
      .select()
      .single() as { data: any, error: any }

    if (productError) throw productError
    const productId = product.id

    try {
      // 2. Link Collections
      if (collectionIds.length > 0) {
        const collectionsToInsert = collectionIds.map(cid => ({
          product_id: productId,
          collection_id: cid,
          tenant_id: tenantId
        }))
        const { error: collError } = await supabase.from('product_collections').insert(collectionsToInsert as never)
        if (collError) throw collError
      }

      // 3. Create Variants
      if (variantsPayload.length > 0) {
        const variantsToInsert = variantsPayload.map(v => ({
          ...v,
          product_id: productId,
          tenant_id: tenantId
        }))
        const { error: varError } = await supabase.from('product_variants').insert(variantsToInsert as never)
        if (varError) throw varError
      }

      // 4. Upload & Create Images
      if (imageFiles.length > 0) {
        const imagesToInsert = []
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          
          // Image Compression
          const compressionOptions = {
            maxSizeMB: 0.5, // 500KB max
            maxWidthOrHeight: 1200,
            useWebWorker: true
          }
          
          let fileToUpload = file;
          try {
            if (file.type.startsWith('image/')) {
              fileToUpload = await imageCompression(file, compressionOptions)
            }
          } catch (e) {
            console.warn('Image compression failed, using original file', e)
          }

          const { path, url } = await storageService.uploadProductImage(tenantId, productId, fileToUpload)
          imagesToInsert.push({
            product_id: productId,
            tenant_id: tenantId,
            storage_path: path,
            public_url: url,
            position: i,
            is_primary: i === 0
          })
        }
        
        if (imagesToInsert.length > 0) {
          const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert as never)
          if (imgError) throw imgError
        }
      }

      return product
    } catch (error) {
      // Rollback
      await supabase.from('products').delete().eq('id', productId).eq('tenant_id', tenantId)
      throw error
    }
  },

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) throw error
  }
}

