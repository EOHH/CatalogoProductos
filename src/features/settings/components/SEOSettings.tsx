import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { settingsService } from '../services/settings.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function SEOSettings() {
  const { tenant, settings } = useTenant()
  const queryClient = useQueryClient()
  
  const [seoTitle, setSeoTitle] = useState(settings?.store_name || '')
  const [seoDescription, setSeoDescription] = useState(settings?.description || '')
  
  // States para dominio y slug
  const [slug, setSlug] = useState(tenant?.slug || '')
  const [slugError, setSlugError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Función de validación de slug
  const validateSlug = (val: string) => {
    const normalized = val.toLowerCase().trim()
    if (!normalized) return 'El subdominio no puede estar vacío.'
    if (!/^[a-z0-9-]+$/.test(normalized)) return 'Solo se permiten letras, números y guiones.'
    if (normalized.length < 3) return 'El subdominio debe tener al menos 3 caracteres.'
    return ''
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase()
    setSlug(val)
    setSlugError(validateSlug(val))
  }

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      // 1. Update Settings (SEO)
      await settingsService.updateTenantSettings(tenant!.id, {
        store_name: seoTitle,
        description: seoDescription
      })

      // 2. Update Slug if changed
      if (slug && slug !== tenant?.slug) {
        await settingsService.updateTenantSlug(tenant!.id, slug)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
      queryClient.invalidateQueries({ queryKey: ['public-tenant'] })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    },
    onError: (error: any) => {
      setSlugError(error.message || 'Ocurrió un error al guardar los cambios')
    }
  })

  const handleSave = () => {
    if (slugError) return // Bloquear guardado si hay error en slug
    
    updateSettingsMutation.mutate()
  }
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">SEO, Metadatos y Dominio</h2>
      <p className="text-sm text-muted-foreground mb-6">Optimiza cómo aparece tu tienda en Google, configúrala para compartir en redes sociales y gestiona las URLs de acceso a tu catálogo.</p>
      
      <div className="space-y-8 max-w-lg">
        {/* DOMINIO DEL CATÁLOGO */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-zinc-800 border-b pb-2">Dominio del catálogo</h3>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Subdominio (Slug)</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground text-sm">
                https://
              </span>
              <input 
                type="text" 
                value={slug}
                onChange={handleSlugChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="mi-tienda" 
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground text-sm">
                .catalogo.app
              </span>
            </div>
            {slugError ? (
              <p className="mt-1 text-sm text-red-600">{slugError}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                URL actual: <strong>https://{slug}.catalogo.app</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1 flex items-center justify-between">
              Dominio Personalizado
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Próximamente
              </span>
            </label>
            <input 
              type="text" 
              value={tenant?.custom_domain || ''}
              disabled
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground cursor-not-allowed sm:text-sm" 
              placeholder="www.mitienda.com"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              La configuración de DNS para dominios propios estará disponible próximamente.
            </p>
          </div>
        </div>

        {/* SEO */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-zinc-800 border-b pb-2">Metadatos SEO</h3>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Título SEO (Etiqueta &lt;title&gt;)</label>
          <input 
            type="text" 
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
            placeholder="Ej. Mi Tienda | Los mejores productos" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descripción Meta</label>
          <textarea 
            rows={3} 
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
            placeholder="Una breve descripción de lo que vendes..."
          />
        </div>
      </div>
    </div>
      
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        <button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-70"
        >
          {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar Cambios
        </button>
        
        {isSuccess && (
          <span className="text-emerald-600 text-sm font-medium flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Guardado correctamente
          </span>
        )}
      </div>
    </div>
  )
}
