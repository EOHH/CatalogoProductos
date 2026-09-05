import { Menu, Search, Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-20 bg-transparent px-4 md:px-8 lg:px-10 flex items-center justify-between sticky top-0 z-20 w-full pt-4 md:pt-6">
      {/* Botón menú móvil (Solo visible en móvil) */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="bg-card rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 h-10 w-10">
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
      </div>

      {/* Título/Logo móvil */}
      <div className="md:hidden absolute left-1/2 -translate-x-1/2">
        <span className="font-serif font-semibold text-lg text-primary flex items-center">
          <span className="text-xl mr-1 text-[#dcb38a]">♛</span> Catálogo
        </span>
      </div>

      {/* Espaciador para Desktop si no hay breadcrumb aquí */}
      <div className="hidden md:block w-1/4"></div>

      {/* Search Bar (Centrado en Desktop) */}
      <div className="hidden md:flex flex-1 justify-center max-w-xl px-4">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar en tu catálogo..." 
            className="w-full h-12 pl-11 pr-4 rounded-[1.5rem] bg-card border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] focus:outline-none focus:ring-1 focus:ring-primary/50 text-[14px] transition-all"
          />
        </div>
      </div>

      {/* Acciones Derecha (Bell, Help) */}
      <div className="flex items-center space-x-3 md:w-1/4 justify-end">
        {/* Notificaciones */}
        <button className="relative h-12 w-12 rounded-2xl bg-card border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-[18px] w-[18px] rounded-full bg-rose-500 border-[2.5px] border-card dark:border-zinc-900 text-[9px] font-bold text-white flex items-center justify-center">
            2
          </span>
        </button>
        
        {/* Theme Toggle */}
        <div className="flex h-12 w-12 rounded-2xl bg-card border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] items-center justify-center">
          <ThemeToggle showLabel={false} />
        </div>
        
        {/* Ayuda (Solo Desktop) */}
        <button className="hidden md:flex h-12 w-12 rounded-2xl bg-card border border-zinc-200 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
