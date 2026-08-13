import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { settingsService } from '../services/settings.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function GeneralSettings() {
  const { tenant, settings } = useTenant()
  const queryClient = useQueryClient()
  
  const [storeName, setStoreName] = useState(settings?.store_name || '')
  const [currency, setCurrency] = useState(settings?.currency || 'USD')
  const [isSuccess, setIsSuccess] = useState(false)

  const updateSettingsMutation = useMutation({
    mutationFn: () => settingsService.updateTenantSettings(tenant!.id, {
      store_name: storeName,
      currency: currency
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
      <p className="text-sm text-zinc-500 mb-6">Administra el nombre de tu tienda y datos de contacto básicos.</p>
      
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre de la tienda</label>
          <input 
            type="text" 
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
            placeholder="Ej. Mi Tienda" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Moneda Principal</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="PEN">PEN (S/)</option>
            <option value="MXN">MXN ($)</option>
          </select>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center gap-4">
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
