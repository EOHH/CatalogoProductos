import { Link } from 'react-router-dom'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#fdfbfb]/90 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center group">
          <span className="font-serif text-3xl font-medium tracking-wide text-[#7a1c33] group-hover:opacity-90 transition-opacity">
            GOTTI
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#7a1c33]/70 font-semibold mt-0.5">
            Catalogs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-[#7a1c33] border-b-2 border-[#7a1c33] pb-1">Inicio</a>
          <a href="#caracteristicas" className="text-sm font-medium text-zinc-600 hover:text-[#7a1c33] transition-colors">Características</a>
          <a href="#como-funciona" className="text-sm font-medium text-zinc-600 hover:text-[#7a1c33] transition-colors">Cómo funciona</a>
          <a href="#boutiques" className="text-sm font-medium text-zinc-600 hover:text-[#7a1c33] transition-colors">Para boutiques</a>
          <a href="#precios" className="text-sm font-medium text-zinc-600 hover:text-[#7a1c33] transition-colors">Precios</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="hidden sm:inline-flex text-sm font-bold text-[#7a1c33] hover:opacity-80 transition-opacity"
          >
            Iniciar sesión
          </Link>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center bg-[#7a1c33] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-[#7a1c33]/90 transition-all shadow-sm"
          >
            Crear mi catálogo
          </Link>
        </div>
      </div>
    </header>
  )
}
