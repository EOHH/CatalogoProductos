import { Navigate, Outlet } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'
import type { Database } from '@/types/database.types'

type Role = Database['public']['Tables']['profiles']['Row']['role'] | 'owner'

interface RoleRouteProps {
  requiredRole: Role
}

export function RoleRoute({ requiredRole }: RoleRouteProps) {
  const { hasRole, isLoading } = usePermissions()

  if (isLoading) {
    return null // ProtectedRoute already handles the loading UI
  }

  if (!hasRole(requiredRole)) {
    // Redirect to a safe page if they lack permissions
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
