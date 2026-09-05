import { useState } from 'react'
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { supabase } from '@/lib/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'

export function ProfileSettings() {
  const { profile } = useTenant()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passError, setPassError] = useState('')

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated')
      
      // Update full name
      const { error: profileError } = await (supabase
        .from('profiles') as any)
        .update({ full_name: fullName })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden')
        }
        if (newPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }
        
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        })
        
        if (authError) throw authError
      }

      // Update email if provided and changed
      if (email && email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })
        
        if (emailError) throw emailError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
      setIsSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setPassError('')
      setTimeout(() => setIsSuccess(false), 3000)
    },
    onError: (error: any) => {
      setPassError(error.message)
    }
  })

  const handleSave = () => {
    updateProfileMutation.mutate()
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Perfil de Usuario</h2>
      <p className="text-sm text-muted-foreground mb-6">Administra tus datos personales y credenciales de acceso.</p>
      
      <div className="space-y-8 max-w-2xl">
        
        {/* Información Personal */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                placeholder="Ej. Juan Pérez" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
              />
              <p className="text-xs text-muted-foreground mt-1">Si cambias el correo, es posible que recibas un mensaje de confirmación.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Rol en la tienda</label>
              <input 
                type="text" 
                value={profile?.role === 'admin' ? 'Administrador (Dueño)' : 'Editor'}
                disabled
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground rounded-md shadow-sm cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-md font-medium text-foreground border-b pb-2">Seguridad</h3>
          <p className="text-sm text-muted-foreground mb-4">Deja estos campos en blanco si no deseas cambiar tu contraseña.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                  placeholder="Mínimo 6 caracteres" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
                  placeholder="Repite tu contraseña" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          {passError && (
            <p className="text-sm text-rose-600 mt-2">{passError}</p>
          )}
        </div>

        {/* Botón de Guardar */}
        <div className="pt-4 flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="flex items-center justify-center bg-primary text-primary-foreground px-6 py-2 rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
            ) : (
              'Guardar Cambios'
            )}
          </button>
          
          {isSuccess && (
            <span className="text-emerald-600 flex items-center text-sm font-medium animate-in fade-in slide-in-from-left-4">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              ¡Perfil actualizado!
            </span>
          )}
          
          {updateProfileMutation.isError && (
            <span className="text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-left-4">
              Ocurrió un error al guardar.
            </span>
          )}
        </div>
        
      </div>
    </div>
  )
}
