import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTenant } from '@/features/core/TenantProvider'

export function ProtectedRoute() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { isLoading: isTenantLoading } = useTenant()
  const location = useLocation()

  if (isAuthLoading || isTenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Validando sesión...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
