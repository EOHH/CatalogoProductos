import { Link } from 'react-router-dom'

export function LandingFooter() {
  return (
    <footer className="w-full bg-[#fdfbfb] border-t border-zinc-200 pt-16 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          
          <div className="md:col-span-2">
            <Link to="/" className="flex flex-col items-start group mb-4">
              <span className="font-serif text-3xl font-medium tracking-wide text-[#7a1c33] group-hover:opacity-90 transition-opacity">
                GOTTI
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#7a1c33]/70 font-semibold mt-0.5">
                Catalogs
              </span>
            </Link>
            <p className="text-zinc-500 text-xs max-w-[250px]">
              La plataforma premium para crear catálogos digitales y gestionar pedidos por WhatsApp.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider mb-4">Producto</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Características</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Precios</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Ejemplos</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Novedades</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider mb-4">Soporte</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Centro de ayuda</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Tutoriales</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Términos</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Privacidad</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-[#7a1c33] text-sm">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-xs">
            © {new Date().getFullYear()} GOTTI Catalogs. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-xs">A product by</span>
            <span className="font-bold text-zinc-600 text-xs">gotti.dev</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
