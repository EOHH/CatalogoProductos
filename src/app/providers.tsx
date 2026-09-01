import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { TenantProvider } from '@/features/core/TenantProvider'
import { Toaster } from 'sonner'
import { useGlobalRealtimeSync } from '@/hooks/useGlobalRealtimeSync'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Componente Wrapper para ejecutar hooks globales dentro del QueryClientProvider
function GlobalHooks() {
  useGlobalRealtimeSync()
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalHooks />
      <AuthProvider>
        <TenantProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
