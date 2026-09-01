import { supabase } from '@/lib/supabase/client'
import { storageService } from '@/lib/supabase/storage.service'
import imageCompression from 'browser-image-compression'
import type { Product, ProductVariant } from '@/types/catalog'

export type CreateProductPayload = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>
export type CreateVariantPayload = Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'product_id'>

export type UpdateProductPayload = Partial<CreateProductPayload>
export type UpdateVariantPayload = CreateVariantPayload & { id?: string }
export type UpdateImageKeep = { id: string, position: number, is_primary: boolean }

export const productsService = {
  async getProducts(tenantId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_variants(*), product_collections(collection_id)')
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
            maxSizeMB: 0.2, // 200KB max (Ahorro agresivo para tier gratuito)
            maxWidthOrHeight: 1080,
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

  async updateProduct(
    tenantId: string,
    productId: string,
    productPayload: UpdateProductPayload,
    collectionIds: string[],
    variantsPayload: UpdateVariantPayload[],
    imagesToDelete: string[], // IDs de product_images a borrar
    imagesToKeep: UpdateImageKeep[],
    newImageFiles: File[]
  ) {
    // 1. Update Product base
    const { error: productError } = await supabase
      .from('products')
      .update(productPayload as never)
      .eq('id', productId)
      .eq('tenant_id', tenantId)

    if (productError) throw productError

    // 2. Collections (Delete and Insert to resync bridging table)
    await supabase.from('product_collections').delete().eq('product_id', productId).eq('tenant_id', tenantId)
    if (collectionIds.length > 0) {
      const collectionsToInsert = collectionIds.map(cid => ({
        product_id: productId,
        collection_id: cid,
        tenant_id: tenantId
      }))
      const { error: collError } = await supabase.from('product_collections').insert(collectionsToInsert as never)
      if (collError) throw collError
    }

    // 3. Variants (Diffing)
    // a) Get current variants
    const { data: existingVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
    
    const existingVariantIds = ((existingVariants as any[]) || []).map(v => v.id)
    const payloadVariantIds = variantsPayload.filter(v => v.id).map(v => v.id as string)

    // b) Delete missing variants
    const variantsToDelete = existingVariantIds.filter(id => !payloadVariantIds.includes(id))
    if (variantsToDelete.length > 0) {
      await supabase.from('product_variants').delete().in('id', variantsToDelete).eq('tenant_id', tenantId)
    }

    // c) Update / Insert
    for (const v of variantsPayload) {
      if (v.id) {
        // Update existing
        const { id, ...updateData } = v
        await supabase.from('product_variants')
          .update(updateData as never)
          .eq('id', id as string)
          .eq('tenant_id', tenantId)
      } else {
        // Insert new
        await supabase.from('product_variants')
          .insert({ ...v, product_id: productId, tenant_id: tenantId } as never)
      }
    }

    // 4. Update positions & is_primary of kept images
    for (const img of imagesToKeep) {
      await supabase.from('product_images')
        .update({ position: img.position, is_primary: img.is_primary } as never)
        .eq('id', img.id)
        .eq('tenant_id', tenantId)
    }

    // 5. Delete removed images (DB then Storage)
    if (imagesToDelete.length > 0) {
      // First, get the storage paths
      const { data: imgsToDeleteData } = await supabase
        .from('product_images')
        .select('storage_path')
        .in('id', imagesToDelete)
        .eq('tenant_id', tenantId)

      // Delete from DB first
      const { error: delImgError } = await supabase
        .from('product_images')
        .delete()
        .in('id', imagesToDelete)
        .eq('tenant_id', tenantId)
      
      if (delImgError) throw delImgError

      // Then delete physical files from storage
      if (imgsToDeleteData && imgsToDeleteData.length > 0) {
        const paths = (imgsToDeleteData as any[]).map(img => img.storage_path).filter(Boolean) as string[]
        if (paths.length > 0) {
          await supabase.storage.from('catalogs').remove(paths)
        }
      }
    }

    // 6. Upload new images (Storage then DB)
    if (newImageFiles.length > 0) {
      // Find starting position for new images (after kept images)
      let nextPos = imagesToKeep.length > 0 ? Math.max(...imagesToKeep.map(i => i.position)) + 1 : 0
      // Check if we need a primary image among the new ones
      const hasPrimaryKept = imagesToKeep.some(i => i.is_primary)
      
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i]
        
        const compressionOptions = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true }
        let fileToUpload = file;
        try {
          if (file.type.startsWith('image/')) {
            fileToUpload = await imageCompression(file, compressionOptions)
          }
        } catch (e) {
          console.warn('Image compression failed', e)
        }

        const { path, url } = await storageService.uploadProductImage(tenantId, productId, fileToUpload)
        
        const isPrimary = !hasPrimaryKept && i === 0
        
        const { error: imgError } = await supabase.from('product_images').insert({
          product_id: productId,
          tenant_id: tenantId,
          storage_path: path,
          public_url: url,
          position: nextPos++,
          is_primary: isPrimary
        } as never)

        if (imgError) {
          // Compensate: remove from storage if DB insert fails
          await supabase.storage.from('catalogs').remove([path])
          throw imgError
        }
      }
    }
  },

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    // 1. Obtener imágenes asociadas para borrar del Storage
    const { data: images } = await supabase
      .from('product_images')
      .select('storage_path')
      .eq('product_id', id)
      .eq('tenant_id', tenantId)

    // 2. Eliminar producto (ON DELETE CASCADE se encarga de las filas en BD)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) throw error

    // 3. Eliminar archivos físicos de Storage
    if (images && images.length > 0) {
      const paths = (images as any[]).map(img => img.storage_path).filter(Boolean) as string[]
      if (paths.length > 0) {
        await supabase.storage.from('catalogs').remove(paths)
      }
    }
  }
}

