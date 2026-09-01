import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Home, Package, ShoppingCart, Users, MoreHorizontal } from 'lucide-react'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

export function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="h-screen bg-background flex text-foreground font-sans overflow-hidden">
      <ScrollToTop />
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-primary border-none">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen max-w-full relative">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Usamos pb-24 en móvil para evitar que el bottom nav tape el contenido */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-24 md:pb-8">
          <div className="mx-auto max-w-[1200px] w-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation (Solo visible en móviles) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 flex justify-around items-center h-16 px-2 z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <NavItem icon={<Home className="h-5 w-5" />} label="Inicio" active={location.pathname === '/dashboard'} />
          <NavItem icon={<Package className="h-5 w-5" />} label="Productos" active={location.pathname.includes('/products')} />
          <NavItem icon={<ShoppingCart className="h-5 w-5" />} label="Pedidos" active={location.pathname.includes('/orders')} />
          <NavItem icon={<Users className="h-5 w-5" />} label="Clientes" active={location.pathname.includes('/customers')} />
          <NavItem icon={<MoreHorizontal className="h-5 w-5" />} label="Más" active={false} onClick={() => setIsMobileMenuOpen(true)} />
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
