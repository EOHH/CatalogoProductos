import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Package, Clock, CheckCircle, Truck, XCircle, RotateCw, Box } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { crmService, type Order } from '../dashboard/services/crm.service'

const ORDER_STATUSES = [
  { id: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'paid', label: 'Pagado', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'in_production', label: 'En confección', icon: RotateCw, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'packaging', label: 'Empaquetando', icon: Box, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'delivered', label: 'Entregado', icon: Package, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' }
]

export function OrdersView() {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['crm-orders', tenant?.id],
    queryFn: () => crmService.getOrders(tenant!.id),
    enabled: !!tenant?.id
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: Order['status'] }) => crmService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-orders', tenant?.id] })
    }
  })

  // Local state for optimistic drag and drop
  const [localOrders, setLocalOrders] = useState<any[]>([])

  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('orderId')
    
    // Optimistic update
    setLocalOrders(current => current.map(o => 
      o.id === orderId ? { ...o, status: statusId } : o
    ))

    // Real update
    updateStatus.mutate({ id: orderId, status: statusId as Order['status'] })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RotateCw className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-700 font-sans">
      <div className="flex items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Pedidos
          </h1>
          <p className="text-[15px] text-zinc-500 mt-1">
            Tablero Kanban interactivo para gestionar tus ventas por WhatsApp
          </p>
        </div>
        <Link 
          to="/dashboard/orders/new"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {ORDER_STATUSES.map(status => {
            const columnOrders = localOrders.filter(o => o.status === status.id)
            const Icon = status.icon

            return (
              <div 
                key={status.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.id)}
                className="w-80 flex flex-col bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden shrink-0"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-zinc-500" />
                    <h3 className="font-semibold text-zinc-900">{status.label}</h3>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3">
                  {columnOrders.map(order => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-zinc-400">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-zinc-900">
                          {order.customers?.first_name} {order.customers?.last_name || ''}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {order.customers?.phone || order.customers?.email}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-100 pt-3">
                        <span className="text-xs font-medium text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-zinc-900">
                          S/ {Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {columnOrders.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg text-xs text-zinc-400">
                      Arrastra un pedido aquí
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
