import { supabase } from '@/lib/supabase/client'
import type { DashboardStats } from '../hooks/useDashboardStats'

export const dashboardService = {
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    // 1. Obtener KPIs (Total Ventas, Pedidos, Productos, Clientes)
    const [
      { count: productsCount },
      { count: customersCount },
      { data: ordersData },
      { data: recentOrders }
    ] = await Promise.all([
      (supabase.from('products') as any).select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      (supabase.from('customers') as any).select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      (supabase.from('orders') as any).select('total_amount').eq('tenant_id', tenantId).neq('status', 'cancelled'),
      (supabase.from('orders') as any).select('id, total_amount, created_at, status').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(5)
    ])

    const totalVentas = ordersData?.reduce((acc: number, curr: any) => acc + Number(curr.total_amount || 0), 0) || 0
    const pedidosCount = ordersData?.length || 0

    const formattedVentas = `S/ ${totalVentas.toFixed(2)}`

    // 2. Formatear la respuesta
    const kpis: DashboardStats['kpis'] = [
      { id: 'ventas', title: 'Ventas totales', value: formattedVentas, trend: '+0%', iconBg: 'bg-purple-100', trendColor: 'text-zinc-500' },
      { id: 'productos', title: 'Productos', value: String(productsCount || 0), trend: '0 nuevos', iconBg: 'bg-rose-100', trendColor: 'text-zinc-500' },
      { id: 'pedidos', title: 'Pedidos', value: String(pedidosCount), trend: '+0%', iconBg: 'bg-orange-100', trendColor: 'text-zinc-500' },
      { id: 'clientes', title: 'Clientes', value: String(customersCount || 0), trend: '+0%', iconBg: 'bg-emerald-100', trendColor: 'text-zinc-500' }
    ]

    const recentActivity: DashboardStats['recentActivity'] = (recentOrders || []).map((o: any) => ({
      id: o.id,
      title: `Nuevo pedido por S/ ${Number(o.total_amount).toFixed(2)}`,
      type: 'order',
      iconBg: 'bg-rose-100',
      time: new Date(o.created_at).toLocaleDateString()
    }))

    return {
      kpis,
      salesChart: { total: formattedVentas, trend: '+0%' },
      topProducts: [], // Todo: Implementar si se requiere
      recentActivity
    }
  }
}
