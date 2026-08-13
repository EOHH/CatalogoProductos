import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/core/ProtectedRoute'
import { RoleRoute } from '@/features/core/RoleRoute'
import { AppShell } from '@/components/layout/AppShell'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Login } from '@/features/auth/Login'
import { Register } from '@/features/auth/Register'
import { useAuth } from '@/features/auth/AuthProvider'

// Importando las vistas reales (Stubs o Finales)
import { DashboardHome } from '@/features/dashboard/DashboardHome'
import { ProductsView } from '@/features/products/ProductsView'
import { CollectionsView } from '@/features/collections/CollectionsView'
import { CategoriesView } from '@/features/categories/CategoriesView'
import { OrdersView } from '@/features/orders/OrdersView'
import { NewOrder } from '@/features/orders/NewOrder'
import { CustomersView } from '@/features/customers/CustomersView'
import { CouponsView } from '@/features/coupons/CouponsView'
import { ReportsView } from '@/features/reports/ReportsView'
import { MarketingView } from '@/features/marketing/MarketingView'
import { SettingsView } from '@/features/settings/SettingsView'
import { NotificationsView } from '@/features/notifications/NotificationsView'

// Storefront Imports
import { StoreProvider } from '@/features/storefront/providers/StoreProvider'
import { StoreLayout } from '@/features/storefront/components/StoreLayout'
import { StoreHome } from '@/features/storefront/pages/StoreHome'
import { CatalogView } from '@/features/storefront/pages/CatalogView'
import { ProductDetail } from '@/features/storefront/pages/ProductDetail'
import { WishlistView } from '@/features/storefront/pages/WishlistView'

// Custom guard to redirect logged-in users away from /login
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <StoreProvider>
        <StoreLayout />
      </StoreProvider>
    ),
    children: [
      { index: true, element: <StoreHome /> },
      { path: 'catalog', element: <CatalogView type="all" /> },
      { path: 'category/:slug', element: <CatalogView type="category" /> },
      { path: 'collection/:slug', element: <CatalogView type="collection" /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'wishlist', element: <WishlistView /> }
    ]
  },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />, 
    children: [
      {
        element: <AppShell />, 
        children: [
          {
            index: true,
            element: <DashboardHome />
          },
          {
            path: 'products',
            element: <RoleRoute requiredRole="editor" />,
            children: [{ index: true, element: <ProductsView /> }]
          },
          {
            path: 'collections',
            element: <RoleRoute requiredRole="editor" />,
            children: [{ index: true, element: <CollectionsView /> }]
          },
          {
            path: 'categories',
            element: <RoleRoute requiredRole="editor" />,
            children: [{ index: true, element: <CategoriesView /> }]
          },
          {
            path: 'orders',
            element: <RoleRoute requiredRole="editor" />,
            children: [
              { index: true, element: <OrdersView /> },
              { path: 'new', element: <NewOrder /> }
            ]
          },
          {
            path: 'customers',
            element: <RoleRoute requiredRole="editor" />,
            children: [{ index: true, element: <CustomersView /> }]
          },
          {
            path: 'coupons',
            element: <RoleRoute requiredRole="admin" />,
            children: [{ index: true, element: <CouponsView /> }]
          },
          {
            path: 'reports',
            element: <RoleRoute requiredRole="admin" />,
            children: [{ index: true, element: <ReportsView /> }]
          },
          {
            path: 'marketing',
            element: <RoleRoute requiredRole="admin" />,
            children: [{ index: true, element: <MarketingView /> }]
          },
          {
            path: 'settings',
            element: <RoleRoute requiredRole="admin" />,
            children: [{ index: true, element: <SettingsView /> }]
          },
          {
            path: 'notifications',
            element: <RoleRoute requiredRole="editor" />,
            children: [{ index: true, element: <NotificationsView /> }]
          }
        ]
      }
    ]
  }
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
