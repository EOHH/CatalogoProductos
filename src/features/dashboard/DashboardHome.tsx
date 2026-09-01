
import { Card } from '@/components/ui/card'
import { 
  ShoppingBag, 
  Package, 
  ShoppingCart, 
  Users, 
  ArrowRight, 
  Calendar,
  ChevronDown,
  ArrowUpRight,
  UserPlus,
  Ticket
} from 'lucide-react'
import { useDashboardStats } from './hooks/useDashboardStats'

export function DashboardHome() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mapeamos los tipos del hook a los iconos correspondientes
  const getIcon = (id: string) => {
    switch(id) {
      case 'ventas': return <ShoppingBag className="w-5 h-5 text-purple-600" />
      case 'productos': return <Package className="w-5 h-5 text-rose-500" />
      case 'pedidos': return <ShoppingCart className="w-5 h-5 text-orange-500" />
      case 'clientes': return <Users className="w-5 h-5 text-emerald-600" />
      default: return <Package className="w-5 h-5 text-zinc-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'order': return <ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
      case 'product': return <Package className="w-3.5 h-3.5 text-purple-600" />
      case 'customer': return <UserPlus className="w-3.5 h-3.5 text-orange-500" />
      case 'coupon': return <Ticket className="w-3.5 h-3.5 text-emerald-600" />
      default: return <Package className="w-3.5 h-3.5 text-zinc-500" />
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700 font-sans">
      
      {/* 1. HERO SECTION */}
      <div className="relative w-full rounded-[2rem] bg-[#fcf2f4] overflow-hidden flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[280px]">
        {/* Lado izquierdo (Texto) */}
        <div className="p-8 md:p-12 flex-1 relative z-10 flex flex-col justify-center">
          <div className="absolute top-6 right-8 md:hidden bg-white/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center text-[11px] font-medium text-zinc-600 shadow-sm">
            <Calendar className="w-3 h-3 mr-2 text-zinc-400" />
            8 - 15 Mayo, 2025
          </div>
          
          <p className="text-[13px] font-medium text-zinc-500 mb-3 flex items-center">
            ¡Bienvenida de nuevo, María! <span className="ml-1 text-base">👋</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-serif text-zinc-900 leading-tight mb-4 tracking-tight">
            Todo en orden, <br />
            tu catálogo brilla ✨
          </h1>
          <p className="text-[14px] text-zinc-600 max-w-[280px] leading-relaxed mb-8">
            Administra tu tienda, productos y pedidos desde un solo lugar.
          </p>
          <div>
            <button className="bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold px-6 py-3 rounded-xl shadow-sm transition-all flex items-center">
              Ir a productos <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Lado derecho (Imagen y DatePicker en Desktop) */}
        <div className="hidden md:block w-1/2 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/dashboard-hero.png')" }}>
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur px-4 py-2 rounded-xl flex items-center text-[12px] font-medium text-zinc-600 shadow-sm border border-white">
            8 - 15 Mayo, 2025 <Calendar className="w-4 h-4 ml-3 text-zinc-400" />
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fcf2f4] to-transparent"></div>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.kpis.map(kpi => (
          <StatCard 
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            icon={getIcon(kpi.id)}
            iconBg={kpi.iconBg}
            trendColor={kpi.trendColor}
          />
        ))}
      </div>

      {/* 3. MIDDLE SECTION (Grid 3 cols on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART (Ventas) */}
        <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[15px] text-zinc-900">Ventas</h3>
            <button className="flex items-center text-[11px] font-medium text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
              Esta semana <ChevronDown className="ml-2 w-3 h-3" />
            </button>
          </div>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">{stats.salesChart.total}</span>
            <span className="flex items-center text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {stats.salesChart.trend}
            </span>
          </div>
          {/* Fake Chart SVG replaced with dynamic polyline */}
          <div className="flex-1 w-full relative mt-auto">
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-zinc-400 font-medium">
              <span>Máx</span><span></span><span></span><span></span><span></span><span></span><span>S/ 0</span>
            </div>
            <div className="absolute left-8 right-0 top-2 bottom-6">
              <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="none" className="overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {(() => {
                  const data = stats.salesChart.data || []
                  if (data.length === 0) return null
                  const maxVal = Math.max(...data.map(d => d.value), 1)
                  const points = data.map((d, i) => {
                    const x = i * 50
                    const y = 130 - ((d.value / maxVal) * 120)
                    return `${x},${y}`
                  })
                  
                  const linePath = `M ${points.join(' L ')}`
                  const fillPath = `${linePath} L 300,130 L 0,130 Z`
                  const lastY = 130 - ((data[data.length - 1].value / maxVal) * 120)

                  return (
                    <>
                      <path d={fillPath} fill="url(#lineGrad)" />
                      <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="300" cy={lastY} r="4" fill="white" stroke="#8b5cf6" strokeWidth="2" />
                      <rect x="270" y={lastY - 25} width="45" height="18" rx="4" fill="white" stroke="#f4f4f5" />
                      <text x="292.5" y={lastY - 13} fontSize="8" fontWeight="bold" fill="#8b5cf6" textAnchor="middle">{stats.salesChart.total.replace('.00', '')}</text>
                    </>
                  )
                })()}
              </svg>
            </div>
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-zinc-400 font-medium">
              {(stats.salesChart.data || []).map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* PRODUCTOS MAS VENDIDOS */}
        <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[15px] text-zinc-900">Productos más vendidos</h3>
            <button className="text-[11px] font-medium text-primary hover:underline">Ver todos</button>
          </div>
          <div className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-2 scrollbar-none">
            {stats.topProducts.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <span className="text-[13px] text-zinc-400">Aún no hay ventas</span>
              </div>
            )}
            {stats.topProducts.map(product => (
              <ProductRow 
                key={product.id} 
                img={product.img} 
                name={product.name} 
                sales={product.sales} 
                price={product.price} 
              />
            ))}
          </div>
          <div className="pt-4 mt-auto">
            <button className="w-full py-2.5 rounded-xl bg-primary/5 text-primary text-[12px] font-bold hover:bg-primary/10 transition-colors">
              Ver todos los productos
            </button>
          </div>
        </Card>

        {/* ACTIVIDAD RECIENTE */}
        <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-[15px] text-zinc-900">Actividad reciente</h3>
            <button className="text-[11px] font-medium text-primary hover:underline">Ver toda</button>
          </div>
          <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 scrollbar-none relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-zinc-100 z-0"></div>
            {stats.recentActivity.length === 0 && (
              <div className="flex flex-1 items-center justify-center relative z-10 bg-white">
                <span className="text-[13px] text-zinc-400">No hay actividad reciente</span>
              </div>
            )}
            {stats.recentActivity.map(activity => (
              <ActivityRow 
                key={activity.id} 
                icon={getActivityIcon(activity.type)} 
                iconBg={activity.iconBg} 
                title={activity.title} 
                time={activity.time} 
              />
            ))}
          </div>
          <div className="pt-4 mt-auto z-10">
            <button className="w-full py-2.5 rounded-xl bg-primary/5 text-primary text-[12px] font-bold hover:bg-primary/10 transition-colors">
              Ver toda la actividad
            </button>
          </div>
        </Card>

      </div>

      {/* 4. BOTTOM BANNER */}
      <div className="relative w-full rounded-[2rem] bg-[#361320] overflow-hidden flex flex-col md:flex-row shadow-lg min-h-[160px] md:h-[200px]">
        <div className="absolute inset-0 bg-[url('/images/dashboard-banner.png')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2c0e18] via-[#431726]/80 to-transparent"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center w-full md:w-2/3">
          <h2 className="text-2xl md:text-[28px] font-serif text-white leading-tight mb-3 tracking-tight">
            Lleva tu marca al siguiente nivel
          </h2>
          <p className="text-[13px] text-white/70 max-w-md leading-relaxed mb-6">
            Descubre reportes avanzados, automatizaciones y herramientas exclusivas para hacer crecer tu catálogo de moda.
          </p>
          <div>
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[12px] font-semibold px-5 py-2.5 rounded-lg backdrop-blur-sm transition-all flex items-center">
              Explorar herramientas <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  )
}

function StatCard({ title, value, trend, icon, iconBg, trendColor }: { title: string, value: string, trend: string, icon: React.ReactNode, iconBg: string, trendColor: string }) {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-[0_4px_24px_rgb(0,0,0,0.02)] p-5 md:p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-medium text-zinc-500 mb-1">{title}</p>
        <h4 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">{value}</h4>
        <p className={`text-[10px] md:text-[11px] font-medium mt-1.5 ${trendColor}`}>
          {trend} <span className="text-zinc-400 font-normal ml-0.5 hidden sm:inline">vs semana anterior</span>
        </p>
      </div>
    </Card>
  )
}

function ProductRow({ img, name, sales, price }: { img: string, name: string, sales: string, price: string }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center space-x-3">
        <img src={img} alt={name} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-zinc-100" />
        <div>
          <p className="text-[13px] font-medium text-zinc-900 line-clamp-1 group-hover:text-primary transition-colors">{name}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{sales}</p>
        </div>
      </div>
      <div className="text-right pl-2">
        <p className="text-[13px] font-bold text-zinc-900">{price}</p>
      </div>
    </div>
  )
}

function ActivityRow({ icon, iconBg, title, time }: { icon: React.ReactNode, iconBg: string, title: string, time: string }) {
  return (
    <div className="flex items-start space-x-4 relative z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white ${iconBg}`}>
        {icon}
      </div>
      <div className="pt-1">
        <p className="text-[12px] font-medium text-zinc-900 leading-snug pr-2">{title}</p>
        <p className="text-[10px] text-zinc-400 mt-1">{time}</p>
      </div>
    </div>
  )
}
