import { Outlet, useLocation } from 'react-router-dom'
import { Shirt, Gem, ShoppingBag, TrendingUp, ShieldCheck, Clock, Smartphone, Lock } from 'lucide-react'
import { ScrollToTop } from '@/components/layout/ScrollToTop'

// Utilizaremos Shirt (camisa) como logo para simular el de la moda

export function AuthLayout() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      <ScrollToTop />
      {/* Lado Izquierdo - Visual / Branding (Oculto en móvil) */}
      <div className={`hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden ${isLogin ? 'text-white' : 'text-zinc-800'}`}>
        {/* Imagen de fondo (El usuario colocará estas imágenes en /public/images/) */}
        <div className="absolute inset-0 z-0">
          <img 
            src={isLogin ? "/images/login-bg.png" : "/images/register-bg.png"} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          {/* Capa de oscurecimiento suave para el login, ya que es oscuro */}
          {isLogin && <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />}
          {/* Para el registro, un gradiente muy sutil si la imagen no tiene fondo propio */}
          {!isLogin && <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-transparent" />}
        </div>

        {/* Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className={`h-10 w-10 flex items-center justify-center rounded-xl backdrop-blur-md ${isLogin ? 'bg-white/20' : 'bg-primary/10'}`}>
            <Shirt className={`h-6 w-6 ${isLogin ? 'text-white' : 'text-primary'}`} />
          </div>
          <span className="text-xl font-semibold tracking-tight font-sans">
            Catálogo Premium
          </span>
        </div>

        {/* Main Copy & Features */}
        <div className="relative z-10 max-w-lg mt-12 mb-auto">
          {!isLogin ? (
            // REGISTRO COPY
            <div className="space-y-12">
              <h1 className="text-[3.5rem] leading-[1.1] font-serif tracking-tight text-zinc-900">
                Crea tu catálogo.<br />
                <span className="text-primary italic">Impulsa tu marca.</span><br />
                Inspira al mundo.
              </h1>
              
              <p className="text-lg text-zinc-600 max-w-sm leading-relaxed">
                La plataforma más elegante para mostrar tus colecciones, conectar con tus clientes y hacer crecer tu negocio de moda.
              </p>

              <div className="space-y-6 pt-4">
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gem className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Catálogos impactantes</h3>
                    <p className="text-sm text-zinc-600">Diseños visuales que enamoran.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Gestiona tu tienda</h3>
                    <p className="text-sm text-zinc-600">Productos, inventario y pedidos en un solo lugar.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">Crece sin límites</h3>
                    <p className="text-sm text-zinc-600">Herramientas poderosas para escalar tu marca.</p>
                  </div>
                </div>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center gap-4 pt-8">
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-background" />
                  <img src="https://i.pravatar.cc/100?img=5" alt="User" className="w-10 h-10 rounded-full border-2 border-background" />
                  <img src="https://i.pravatar.cc/100?img=9" alt="User" className="w-10 h-10 rounded-full border-2 border-background" />
                </div>
                <p className="text-sm font-medium text-zinc-600">
                  <strong className="text-zinc-900">+10,000 marcas</strong><br />
                  ya confían en nosotros ✨
                </p>
              </div>
            </div>
          ) : (
            // LOGIN COPY
            <div className="space-y-12">
              <h1 className="text-[3.5rem] leading-[1.1] font-serif tracking-tight text-white">
                Bienvenida de nuevo ♡
              </h1>
              
              <p className="text-lg text-white/80 max-w-md leading-relaxed">
                Inicia sesión y continúa construyendo el catálogo de moda que tus clientas aman.
              </p>

              <div className="space-y-8 pt-8">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <ShieldCheck className="h-6 w-6 text-white/90" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Seguro y confiable</h3>
                    <p className="text-sm text-white/70">Tus datos y los de tu tienda siempre protegidos.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <Clock className="h-6 w-6 text-white/90" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Acceso rápido</h3>
                    <p className="text-sm text-white/70">Entra y administra tu tienda en segundos.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1">
                    <Smartphone className="h-6 w-6 text-white/90" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Disponible siempre</h3>
                    <p className="text-sm text-white/70">Desde cualquier dispositivo, en cualquier lugar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Login */}
        {isLogin && (
          <div className="relative z-10 flex items-center gap-2 text-sm text-white/60">
            <Lock className="h-4 w-4" />
            <span>Tu éxito es nuestro compromiso</span>
          </div>
        )}
      </div>

      {/* Lado Derecho - Formulario Centrado */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative">
        {/* Adornos sutiles de fondo para el lado derecho (opcional) */}
        {!isLogin && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        )}

        <div className="w-full max-w-[460px] relative z-10">
          {/* Logo móvil */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10 text-center">
            <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
              <Shirt className="h-7 w-7 text-white" />
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
