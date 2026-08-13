import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTenant } from '@/features/core/TenantProvider'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { usePermissions } from '@/hooks/usePermissions'
import {
  Home,
  Package,
  Layers,
  Tags,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Megaphone,
  Settings,
  Crown,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const navigate = useNavigate()
  const { tenant, profile } = useTenant()
  const { isAdmin } = usePermissions()
  const location = useLocation()
  const { user } = useAuth()

  const links = [
    {
      to: '/dashboard',
      icon: <Home className="h-[18px] w-[18px]" />,
      label: 'Dashboard',
      show: true,
    },
    {
      to: '/dashboard/products',
      icon: <Package className="h-[18px] w-[18px]" />,
      label: 'Productos',
      show: true,
    },
    {
      to: '/dashboard/collections',
      icon: <Layers className="h-[18px] w-[18px]" />,
      label: 'Colecciones',
      show: true,
    },
    {
      to: '/dashboard/categories',
      icon: <Tags className="h-[18px] w-[18px]" />,
      label: 'Categorías',
      show: true,
    },
    {
      to: '/dashboard/orders',
      icon: <ShoppingCart className="h-[18px] w-[18px]" />,
      label: 'Pedidos',
      show: true,
    },
    {
      to: '/dashboard/customers',
      icon: <Users className="h-[18px] w-[18px]" />,
      label: 'Clientes',
      show: true,
    },
    {
      to: '/dashboard/coupons',
      icon: <Ticket className="h-[18px] w-[18px]" />,
      label: 'Cupones',
      show: isAdmin,
    },
    {
      to: '/dashboard/reports',
      icon: <BarChart3 className="h-[18px] w-[18px]" />,
      label: 'Reportes',
      show: isAdmin,
    },
    {
      to: '/dashboard/marketing',
      icon: <Megaphone className="h-[18px] w-[18px]" />,
      label: 'Marketing',
      show: isAdmin,
    },
    {
      to: '/dashboard/settings',
      icon: <Settings className="h-[18px] w-[18px]" />,
      label: 'Configuración',
      show: isAdmin,
    }
  ]

  return (
    <aside className="w-[260px] bg-primary text-white hidden md:flex flex-col relative h-screen border-r border-primary/20">
      
      {/* Brand area */}
      <div className="h-20 flex items-center px-8 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="text-[#f5d0a9]">
            <Crown className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium text-[17px] tracking-wide text-white leading-tight">
              {tenant?.name || 'Catálogo Premium'}
            </span>
            <span className="text-[11px] text-white/50 tracking-wider uppercase font-medium">
              Moda que inspira
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1 scrollbar-none pb-4">
        {links.filter(l => l.show).map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to))
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center space-x-3 px-4 py-[10px] rounded-xl text-[14px] font-medium transition-all duration-300",
                isActive 
                  ? "bg-white/10 text-white shadow-inner border border-white/5" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        })}

        {/* Ad Box */}
        <div className="mt-8 mb-4 mx-2 p-5 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
          <h4 className="text-white font-medium text-[14px] mb-2">Impulsa tu marca</h4>
          <p className="text-white/50 text-[12px] leading-relaxed mb-4">
            Descubre herramientas y estadísticas para crecer tu negocio.
          </p>
          <button className="w-full py-2 bg-[#dcb38a] hover:bg-[#cf9f6e] text-[#4a1c28] text-[13px] font-bold rounded-lg transition-colors">
            Ver Planes
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="h-20 flex-shrink-0 border-t border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white font-bold flex-shrink-0">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-medium text-white leading-tight truncate">
              {profile?.full_name || user?.email || 'Usuario'}
            </span>
            <span className="text-[11px] text-white/50 capitalize">
              {profile?.role || 'Admin'}
            </span>
          </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="text-white/40 hover:text-white transition-colors flex-shrink-0 ml-2" title="Cerrar sesión">
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
      
    </aside>
  )
}

