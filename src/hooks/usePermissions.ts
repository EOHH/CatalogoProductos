import { useTenant } from '@/features/core/TenantProvider'
import type { Database } from '@/types/database.types'

type Role = Database['public']['Tables']['profiles']['Row']['role'] | 'owner'

// Define a hierarchy or simple role mapping
const roleHierarchy: Record<Role, number> = {
  owner: 40,
  admin: 30,
  editor: 20,
  viewer: 10,
}

export function usePermissions() {
  const { role, isLoading } = useTenant()

  const hasRole = (requiredRole: Role) => {
    if (isLoading) return false
    if (!role) return false
    
    // Treat 'admin' from DB as 'owner' or 'admin' depending on your business logic.
    // For this boilerplate, we'll map DB 'admin' to both admin and owner level checks
    const currentRoleLevel = roleHierarchy[role as Role] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0
    
    return currentRoleLevel >= requiredRoleLevel
  }

  return {
    role,
    isLoading,
    hasRole,
    // Helper booleans for common checks
    isAdmin: hasRole('admin'),
    isEditor: hasRole('editor'),
    canEditProducts: hasRole('editor'),
    canManageSettings: hasRole('admin'),
  }
}
