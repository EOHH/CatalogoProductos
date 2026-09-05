import { X, Phone, User, Calendar, Clock, ShoppingBag, Truck, CheckCircle, RotateCw, Box, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { crmService } from '../../dashboard/services/crm.service'
import { getWhatsAppUrl } from '@/utils/whatsapp'

const ORDER_STATUSES = [
  { id: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'paid', label: 'Pagado', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'in_production', label: 'En confección', icon: RotateCw, color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'packaging', label: 'Empaquetando', icon: Box, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' }
]

interface OrderDetailsDrawerProps {
  orderId: string | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}

export function OrderDetailsDrawer({ orderId, isOpen, onClose, onStatusChange }: OrderDetailsDrawerProps) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => crmService.getOrderDetails(orderId!),
    enabled: !!orderId && isOpen
  })

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const currentStatus = ORDER_STATUSES.find(s => s.id === order?.status) || ORDER_STATUSES[0]

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200] transition-opacity"
        onClick={handleBackdropClick}
      />
      <div className="fixed inset-y-0 right-0 z-[201] w-full max-w-lg bg-background shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-card border-b border-zinc-100 dark:border-zinc-800 z-10">
          <div>
            <h2 className="text-xl font-serif text-foreground">
              {isLoading ? 'Cargando...' : `Pedido #${order?.id.slice(0, 8)}`}
            </h2>
            {!isLoading && (
              <p className="text-[13px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(order?.created_at).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:bg-zinc-900/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <RotateCw className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
          ) : !order ? (
            <div className="text-center py-20 text-muted-foreground">No se encontró el pedido.</div>
          ) : (
            <>
              {/* Status Manager */}
              <div className="bg-card p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Estado del Pedido</h3>
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className={`w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all cursor-pointer ${currentStatus.color}`}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s.id} value={s.id} className="text-foreground bg-card">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <currentStatus.icon className="w-4 h-4 opacity-70" />
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-card p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4" /> Cliente
                  </h3>
                  {order.customers?.phone && (
                    <a
                      href={getWhatsAppUrl(order.customers.phone, `Hola ${order.customers.first_name}, te escribimos sobre tu pedido #${order.id.slice(0, 8)}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" /> Escribir WhatsApp
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-[15px]">
                    {order.customers?.first_name} {order.customers?.last_name || ''}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.customers?.phone}</p>
                  {order.customers?.email && (
                    <p className="text-sm text-muted-foreground">{order.customers?.email}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-4 h-4" /> Artículos ({order.order_items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => {
                    const product = item.products
                    const primaryImage = product?.images?.find((img: any) => img.is_primary)?.public_url 
                      || product?.images?.[0]?.public_url
                    
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800 shrink-0 p-1">
                          {primaryImage ? (
                            <img src={primaryImage} alt={product?.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {product?.name || 'Producto eliminado'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cant: {item.quantity} x S/ {Number(item.unit_price).toFixed(2)}
                          </p>
                          <p className="text-sm font-bold text-store-primary mt-1">
                            S/ {Number(item.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <h3 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-2">Notas del Pedido</h3>
                  <p className="text-sm text-amber-900 dark:text-amber-400 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isLoading && order && (
          <div className="p-6 bg-card border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium text-sm uppercase tracking-widest">Total del Pedido</span>
              <span className="text-2xl font-bold text-foreground">S/ {Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
