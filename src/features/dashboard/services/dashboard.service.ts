import { supabase } from '@/lib/supabase/client'
import type { DashboardStats, ChartPoint } from '../hooks/useDashboardStats'

export const dashboardService = {
  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    const now = new Date()
    
    // Periodos para calcular tendencias (7 dias vs 7 dias anteriores)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const tCurrent = sevenDaysAgo.getTime()
    const tPrev = fourteenDaysAgo.getTime()

    const isCurrent = (dStr: string) => new Date(dStr).getTime() >= tCurrent
    const isPrevious = (dStr: string) => {
      const t = new Date(dStr).getTime()
      return t >= tPrev && t < tCurrent
    }

    // 1. Obtener Datos
    const [
      { data: ordersData },
      { data: productsData },
      { data: customersData },
      { data: orderItemsData }
    ] = await Promise.all([
      // Orders (for total sales, order count, recent activity, chart)
      supabase.from('orders').select('id, total_amount, created_at, status').eq('tenant_id', tenantId),
      
      // Products (for count trend)
      supabase.from('products').select('created_at').eq('tenant_id', tenantId),
      
      // Customers (for count trend)
      supabase.from('customers').select('created_at').eq('tenant_id', tenantId),

      // Order Items (for Top Products - exclude cancelled and pending)
      supabase.from('order_items').select(`
        product_id,
        quantity,
        total_price,
        orders!inner(tenant_id, status)
      `).eq('orders.tenant_id', tenantId).neq('orders.status', 'cancelled').neq('orders.status', 'pending')
    ])

    const _orders = ordersData as any[] || []
    const _products = productsData as any[] || []
    const _customers = customersData as any[] || []
    const _orderItems = orderItemsData as any[] || []

    const validOrders = _orders.filter(o => o.status !== 'cancelled')

    // 2. Calcular KPIs y Tendencias
    let currentVentas = 0
    let prevVentas = 0
    let currentPedidos = 0
    let prevPedidos = 0
    let currentProductos = 0
    let prevProductos = 0
    let currentClientes = 0
    let prevClientes = 0
    let totalVentasAllTime = 0

    // Ventas y Pedidos
    validOrders.forEach(o => {
      const isRevenue = o.status !== 'pending'
      const amount = Number(o.total_amount || 0)
      
      if (isRevenue) {
        totalVentasAllTime += amount
      }
      
      if (isCurrent(o.created_at)) {
        if (isRevenue) currentVentas += amount
        currentPedidos++
      } else if (isPrevious(o.created_at)) {
        if (isRevenue) prevVentas += amount
        prevPedidos++
      }
    })

    // Productos
    _products.forEach(p => {
      if (isCurrent(p.created_at)) currentProductos++
      else if (isPrevious(p.created_at)) prevProductos++
    })

    // Clientes
    _customers.forEach(c => {
      if (isCurrent(c.created_at)) currentClientes++
      else if (isPrevious(c.created_at)) prevClientes++
    })

    // Helper de tendencia porcentual
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return { trendStr: curr > 0 ? '+100%' : '0%', isPositive: curr >= 0 }
      const diff = curr - prev
      const pct = (diff / prev) * 100
      return {
        trendStr: `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`,
        isPositive: pct >= 0
      }
    }

    const ventasTrend = calcTrend(currentVentas, prevVentas)
    const pedidosTrend = calcTrend(currentPedidos, prevPedidos)
    const clientesTrend = calcTrend(currentClientes, prevClientes)

    const formattedVentas = `S/ ${totalVentasAllTime.toFixed(2)}`

    const kpis: DashboardStats['kpis'] = [
      { id: 'ventas', title: 'Ventas totales', value: formattedVentas, trend: ventasTrend.trendStr, iconBg: 'bg-purple-100', trendColor: ventasTrend.isPositive ? 'text-emerald-600' : 'text-rose-600' },
      { id: 'productos', title: 'Productos', value: String(productsData?.length || 0), trend: `${currentProductos > 0 ? '+' : ''}${currentProductos} nuevos`, iconBg: 'bg-rose-100', trendColor: currentProductos > 0 ? 'text-emerald-600' : 'text-zinc-500' },
      { id: 'pedidos', title: 'Pedidos', value: String(validOrders.length), trend: pedidosTrend.trendStr, iconBg: 'bg-orange-100', trendColor: pedidosTrend.isPositive ? 'text-emerald-600' : 'text-rose-600' },
      { id: 'clientes', title: 'Clientes', value: String(customersData?.length || 0), trend: clientesTrend.trendStr, iconBg: 'bg-emerald-100', trendColor: clientesTrend.isPositive ? 'text-emerald-600' : 'text-rose-600' }
    ]

    // 3. Actividad Reciente
    const recentActivity = [..._orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(o => ({
        id: o.id,
        title: `Nuevo pedido por S/ ${Number(o.total_amount || 0).toFixed(2)}`,
        type: 'order',
        iconBg: 'bg-rose-100',
        time: new Date(o.created_at).toLocaleDateString()
      }))

    // 4. Gráfico de Ventas (Últimos 7 días agrupados por día)
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const chartData: ChartPoint[] = []
    
    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      chartData.push({
        label: daysOfWeek[d.getDay()],
        value: 0,
        // _dateStr para mapear interno
      })
      // Lo guardamos como una propeidad oculta dinámicamente para filtrar
      ;(chartData[chartData.length - 1] as any)._dateStr = dateStr
    }

    validOrders.forEach(o => {
      const isRevenue = o.status !== 'pending'
      if (isRevenue && isCurrent(o.created_at)) {
        const dStr = o.created_at.split('T')[0]
        const point = chartData.find((p: any) => p._dateStr === dStr)
        if (point) point.value += Number(o.total_amount || 0)
      }
    })

    // 5. Top Productos
    const productStats: Record<string, { q: number, total: number }> = {}
    _orderItems.forEach(item => {
      const pid = item.product_id
      if (!productStats[pid]) productStats[pid] = { q: 0, total: 0 }
      productStats[pid].q += item.quantity || 0
      productStats[pid].total += item.total_price || 0
    })

    const topProductIds = Object.entries(productStats)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5)
      .map(([id]) => id)

    let topProducts: DashboardStats['topProducts'] = []
    
    if (topProductIds.length > 0) {
      const { data: pInfo } = await supabase
        .from('products')
        .select('id, name, product_images(public_url)')
        .in('id', topProductIds)

      topProducts = topProductIds.map(id => {
        const info = (pInfo as any[])?.find(p => p.id === id)
        const stat = productStats[id]
        
        // El casting es necesario para leer product_images según el typings de Supabase
        const images = info?.product_images as any[]
        const imgUrl = (images && images.length > 0) ? images[0].public_url : '/placeholder.png'
        
        return {
          id,
          name: info?.name || 'Producto eliminado',
          sales: `${stat.q} vendidos`,
          price: `S/ ${stat.total.toFixed(2)}`,
          img: imgUrl
        }
      })
    }

    // Formatear Ventas Chart Trend (Current vs Prev total)
    const currentSalesTrendStr = calcTrend(currentVentas, prevVentas).trendStr

    return {
      kpis,
      salesChart: { 
        total: `S/ ${currentVentas.toFixed(2)}`, // Mostramos lo de esta semana en el hero del chart
        trend: currentSalesTrendStr, 
        data: chartData 
      },
      topProducts,
      recentActivity
    }
  }
}
