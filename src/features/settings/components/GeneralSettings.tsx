import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { settingsService } from '../services/settings.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function GeneralSettings() {
  const { tenant, settings } = useTenant()
  const queryClient = useQueryClient()
  
  const [storeName, setStoreName] = useState(settings?.store_name || '')
  const [description, setDescription] = useState(settings?.description || '')
  const [phone, setPhone] = useState(settings?.phone || '')
  const [contactEmail, setContactEmail] = useState(settings?.contact_email || '')
  const [address, setAddress] = useState(settings?.address || '')
  
  const [currency, setCurrency] = useState(settings?.currency || 'USD')
  const [locale, setLocale] = useState(settings?.locale || 'es-PE')
  const [timezone, setTimezone] = useState(settings?.timezone || 'America/Lima')

  const [socialInstagram, setSocialInstagram] = useState(settings?.social_instagram || '')
  const [socialFacebook, setSocialFacebook] = useState(settings?.social_facebook || '')
  const [socialTiktok, setSocialTiktok] = useState(settings?.social_tiktok || '')
  
  const [isSuccess, setIsSuccess] = useState(false)

  const updateSettingsMutation = useMutation({
    mutationFn: () => settingsService.updateTenantSettings(tenant!.id, {
      store_name: storeName,
      description: description,
      phone: phone,
      contact_email: contactEmail,
      address: address,
      currency: currency,
      locale: locale,
      timezone: timezone,
      social_instagram: socialInstagram,
      social_facebook: socialFacebook,
      social_tiktok: socialTiktok
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
      queryClient.invalidateQueries({ queryKey: ['public-tenant'] })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    }
  })

  const handleSave = () => {
    updateSettingsMutation.mutate()
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Configuración General</h2>
      <p className="text-sm text-muted-foreground mb-6">Administra los datos principales, contacto y localización de tu tienda.</p>
      
      <div className="space-y-8 max-w-2xl">
        
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la tienda</label>
              <input 
                type="text" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Ej. Mi Tienda" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Descripción Corta</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Frase que identifica a tu marca..." 
              />
            </div>
          </div>
        </div>

        {/* Contacto y Ubicación */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Contacto y Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Número de WhatsApp</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Ej. +51 987 654 321" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Correo de Contacto</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Ej. hola@mitienda.com" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Dirección Física o Cobertura</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Ej. Av. Principal 123 o 'Envíos a todo el país'" 
              />
            </div>
          </div>
        </div>

        {/* Regionalización */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Regionalización</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Moneda Principal</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="MXN">MXN ($)</option>
                <option value="ARS">ARS ($)</option>
                <option value="COP">COP ($)</option>
                <option value="CLP">CLP ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Idioma (Locale)</label>
              <select 
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="es-PE">Español (Perú)</option>
                <option value="es-MX">Español (México)</option>
                <option value="es-ES">Español (España)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Zona Horaria</label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="America/Lima">America/Lima (PET)</option>
                <option value="America/Mexico_City">America/Mexico_City (CST)</option>
                <option value="America/Bogota">America/Bogota (COT)</option>
                <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires (ART)</option>
                <option value="America/Santiago">America/Santiago (CLT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Redes Sociales</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Instagram URL</label>
              <input 
                type="url" 
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="https://instagram.com/tu_tienda" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Facebook URL</label>
              <input 
                type="url" 
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="https://facebook.com/tu_tienda" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">TikTok URL</label>
              <input 
                type="url" 
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="https://tiktok.com/@tu_tienda" 
              />
            </div>
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
