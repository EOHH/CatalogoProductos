import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Clock, CheckCircle, Truck, XCircle, RotateCw, Box, ShoppingBag } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { crmService, type Order } from '../dashboard/services/crm.service'
import { OrderDetailsDrawer } from './components/OrderDetailsDrawer'
import { toast } from 'sonner'

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
    onMutate: async () => {
      // Optimistic update logic is handled by local state
    },
    onSuccess: () => {
      toast.success('Estado del pedido actualizado')
      queryClient.invalidateQueries({ queryKey: ['crm-orders', tenant?.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', tenant?.id] })
    },
    onError: () => {
      toast.error('Error al actualizar el estado')
      // Revert optimistic update by refreshing from server
      setLocalOrders(orders)
    }
  })

  // Local state for optimistic drag and drop
  const [localOrders, setLocalOrders] = useState<any[]>([])
  
  // Modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

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
    
    // Prevent dropping in same status
    const order = localOrders.find(o => o.id === orderId)
    if (!order || order.status === statusId) return

    // Optimistic update
    setLocalOrders(current => current.map(o => 
      o.id === orderId ? { ...o, status: statusId } : o
    ))

    // Real update
    updateStatus.mutate({ id: orderId, status: statusId as Order['status'] })
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Optimistic update
    setLocalOrders(current => current.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ))
    // Real update
    updateStatus.mutate({ id: orderId, status: newStatus as Order['status'] })
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
            Tablero Kanban interactivo para gestionar tus ventas
          </p>
        </div>
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
                      onClick={() => setSelectedOrderId(order.id)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-zinc-200 cursor-pointer hover:border-store-primary hover:shadow-md transition-all active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-store-primary transition-colors">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-bold text-zinc-900 truncate">
                          {order.customers?.first_name} {order.customers?.last_name || ''}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                          {order.customers?.phone || order.customers?.email}
                        </p>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-100 pt-3">
                        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-black text-store-primary">
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
      
      <OrderDetailsDrawer 
        orderId={selectedOrderId} 
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
