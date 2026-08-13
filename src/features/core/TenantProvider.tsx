import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Tenant = Database['public']['Tables']['tenants']['Row']
type TenantSettings = Database['public']['Tables']['tenant_settings']['Row']

interface TenantContextType {
  profile: Profile | null
  tenant: Tenant | null
  settings: TenantSettings | null
  role: Profile['role'] | null
  isLoading: boolean
  error: Error | null
}

const TenantContext = createContext<TenantContextType>({
  profile: null,
  tenant: null,
  settings: null,
  role: null,
  isLoading: true,
  error: null,
})

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth()

  const { data, isLoading: isTenantLoading, error } = useQuery({
    queryKey: ['tenant-context', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      // 1. Get the user's profile to find their tenant and role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) throw profileError
      if (!profileData) {
        // If the profile doesn't exist, it means the RPC failed or wasn't called.
        // We throw an explicit error that can be caught.
        throw new Error('PROFILE_NOT_FOUND')
      }
      
      const profile = profileData as Profile

      // 2. Fetch the tenant info
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single()

      if (tenantError) throw tenantError

      // 3. Fetch tenant settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .single()
        
      // Settings might not exist yet if they are optional, but we will assume they do or handle null
      if (settingsError && settingsError.code !== 'PGRST116') {
         throw settingsError
      }

      return { 
        profile, 
        tenant: tenantData as Tenant, 
        settings: settingsData ? (settingsData as unknown as TenantSettings) : null 
      }
    },
    enabled: !!user?.id, // Only run if user is authenticated
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  const isLoading = isAuthLoading || (!!user && isTenantLoading)

  const value = {
    profile: data?.profile ?? null,
    tenant: data?.tenant ?? null,
    settings: data?.settings ?? null,
    role: data?.profile?.role ?? null,
    isLoading,
    error,
  }

  if (error && error.message === 'PROFILE_NOT_FOUND') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Registro incompleto</h2>
          <p className="text-zinc-500 mb-6 text-[14px]">
            Tu cuenta de usuario existe pero no se terminó de configurar la tienda. Por favor, cierra sesión y vuelve a registrarte.
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  return useContext(TenantContext)
}
