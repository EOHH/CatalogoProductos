import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { TenantProvider } from '@/features/core/TenantProvider'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
