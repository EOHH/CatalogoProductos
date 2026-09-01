import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { useTenant } from '@/features/core/TenantProvider'

export interface KPI {
  id: string
  title: string
  value: string
  trend: string
  iconBg: string
  trendColor: string
}

export interface TopProduct {
  id: string
  name: string
  sales: string
  price: string
  img: string
}

export interface RecentActivity {
  id: string
  title: string
  type: string
  iconBg: string
  time: string
}

export interface ChartPoint {
  label: string
  value: number
}

export interface DashboardStats {
  kpis: KPI[]
  salesChart: { 
    total: string
    trend: string
    data: ChartPoint[] 
  }
  topProducts: TopProduct[]
  recentActivity: RecentActivity[]
}

export function useDashboardStats() {
  const { tenant } = useTenant()
  const tenantId = tenant?.id

  const query = useQuery<DashboardStats>({
    queryKey: ['dashboardStats', tenantId],
    queryFn: () => dashboardService.getDashboardStats(tenantId!),
    enabled: !!tenantId,
    initialData: {
      kpis: [
        { id: 'ventas', title: 'Ventas totales', value: 'S/ 0.00', trend: '0%', iconBg: 'bg-purple-100', trendColor: 'text-zinc-500' },
        { id: 'productos', title: 'Productos', value: '0', trend: '0 nuevos', iconBg: 'bg-rose-100', trendColor: 'text-zinc-500' },
        { id: 'pedidos', title: 'Pedidos', value: '0', trend: '0%', iconBg: 'bg-orange-100', trendColor: 'text-zinc-500' },
        { id: 'clientes', title: 'Clientes', value: '0', trend: '0%', iconBg: 'bg-emerald-100', trendColor: 'text-zinc-500' }
      ],
      salesChart: { total: 'S/ 0.00', trend: '0%', data: [] },
      topProducts: [],
      recentActivity: []
    }
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  }
}
