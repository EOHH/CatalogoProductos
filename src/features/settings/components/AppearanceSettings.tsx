import { useState } from 'react'
import { Check, Smartphone, Loader2 } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { settingsService } from '../services/settings.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Image as ImageIcon } from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Negro Elegante', value: '#000000' },
  { name: 'Azul Indigo', value: '#4f46e5' },
  { name: 'Verde Esmeralda', value: '#10b981' },
  { name: 'Rojo Carmesí', value: '#e11d48' },
  { name: 'Violeta Real', value: '#7c3aed' },
  { name: 'Naranja Vivo', value: '#f97316' },
  { name: 'Rosa Vibrante', value: '#db2777' },
  { name: 'Cian Océano', value: '#06b6d4' },
]

export function AppearanceSettings() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const [primaryColor, setPrimaryColor] = useState(tenant?.primary_color || '#000000')
  const [logoUrl, setLogoUrl] = useState(tenant?.logo_url || '')
  const [faviconUrl, setFaviconUrl] = useState(tenant?.favicon_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const updateTenantMutation = useMutation({
    mutationFn: (updates: { primary_color?: string, logo_url?: string, favicon_url?: string }) => 
      settingsService.updateTenant(tenant!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
      queryClient.invalidateQueries({ queryKey: ['public-tenant'] })
    }
  })

  const handleSave = () => {
    updateTenantMutation.mutate({ 
      primary_color: primaryColor,
      logo_url: logoUrl,
      favicon_url: faviconUrl
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('El archivo no debe pesar más de 2MB')
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      const url = await settingsService.uploadAsset(tenant!.id, file, type)
      if (type === 'logo') setLogoUrl(url)
      else setFaviconUrl(url)
    } catch (err: any) {
      setUploadError('Error al subir el archivo: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium">Personalización de Marca (Live Preview)</h2>
        <p className="text-sm text-zinc-500">Configura los colores de tu tienda y mira los cambios en tiempo real en tu Storefront.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Controls */}
        <div className="space-y-8">
          {/* Logo & Favicon Upload */}
          <div className="space-y-4 pb-6 border-b border-zinc-200">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Logo de la tienda
              </label>
              <p className="text-xs text-zinc-500 mb-3">Recomendado: 512x512px. Máximo 2MB. Tienes un límite de 3 cambios permitidos.</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    disabled={isUploading}
                    className="block w-full text-sm text-zinc-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-zinc-100 file:text-zinc-700
                      hover:file:bg-zinc-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Favicon
              </label>
              <p className="text-xs text-zinc-500 mb-3">El icono pequeño que aparece en la pestaña del navegador. Formato .ico o .png (Máx 2MB).</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/x-icon, image/png"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                    disabled={isUploading}
                    className="block w-full text-sm text-zinc-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-zinc-100 file:text-zinc-700
                      hover:file:bg-zinc-200 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Color Principal
            </label>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setPrimaryColor(color.value)}
                  className={`w-full aspect-square rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                    primaryColor === color.value ? 'border-zinc-900 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {primaryColor === color.value && (
                    <Check className="h-5 w-5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-zinc-500">O ingresa un código HEX personalizado:</span>
              <div className="flex items-center border border-zinc-300 rounded-md overflow-hidden">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 p-0 border-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-24 px-3 py-2 text-sm focus:outline-none uppercase"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-200">
            <button 
              onClick={handleSave}
              disabled={updateTenantMutation.isPending}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors w-full md:w-auto flex items-center justify-center disabled:opacity-70"
            >
              {updateTenantMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Apariencia
            </button>
          </div>
        </div>

        {/* Live Preview iPhone Mockup */}
        <div className="flex justify-center items-center bg-zinc-50 p-8 rounded-2xl border border-zinc-100">
          <div className="relative w-[320px] h-[650px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-zinc-900 overflow-hidden ring-1 ring-zinc-900/10">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-3xl w-40 mx-auto z-20"></div>

            {/* Storefront Mockup UI */}
            <div className="h-full w-full flex flex-col bg-zinc-50 relative z-10 pt-8">
              
              {/* Header */}
              <header className="px-5 py-4 flex justify-between items-center bg-white shadow-sm">
                <div className="font-serif font-bold text-xl">{tenant?.name || 'Mi Tienda'}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <Smartphone className="h-4 w-4" />
                </div>
              </header>

              {/* Banner */}
              <div className="px-5 mt-6 mb-8">
                <h1 className="text-3xl font-serif mb-3 leading-tight">Nueva Colección</h1>
                <p className="text-sm text-zinc-500 mb-4">Descubre los estilos más recientes seleccionados para ti.</p>
                <button 
                  className="px-6 py-2.5 text-white font-medium text-sm transition-colors rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Comprar Ahora
                </button>
              </div>

              {/* Products */}
              <div className="px-5 flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider">Destacados</h2>
                  <span className="text-xs font-medium" style={{ color: primaryColor }}>Ver Todo</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Mock Product 1 */}
                  <div>
                    <div className="aspect-square bg-zinc-200 mb-2 relative group overflow-hidden">
                      <div className="absolute top-2 right-2 text-[10px] font-bold text-white px-2 py-0.5" style={{ backgroundColor: primaryColor }}>NUEVO</div>
                    </div>
                    <div className="text-xs font-medium truncate">Camiseta Essential</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>$25.00</div>
                  </div>
                  {/* Mock Product 2 */}
                  <div>
                    <div className="aspect-square bg-zinc-200 mb-2"></div>
                    <div className="text-xs font-medium truncate">Pantalón Cargo</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>$45.00</div>
                  </div>
                </div>
              </div>

              {/* Bottom Nav */}
              <div className="h-14 bg-white border-t flex justify-around items-center px-4 mt-auto">
                <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-5 h-5 bg-zinc-300 rounded-sm"></div>
                <div className="w-5 h-5 bg-zinc-300 rounded-sm"></div>
                <div className="w-5 h-5 bg-zinc-300 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
