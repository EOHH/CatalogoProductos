import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { crmService, type Customer } from '../../dashboard/services/crm.service'
import { Loader2, Mail, Phone, Calendar, ShoppingBag, Edit2, X, Package } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'

const customerSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable()
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface Props {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
}

export function CustomerDetailsSheet({ customer, isOpen, onClose }: Props) {
  const { tenant } = useTenant()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['crm-customer-orders', tenant?.id, customer?.id],
    queryFn: () => crmService.getCustomerOrders(tenant!.id, customer!.id),
    enabled: !!tenant?.id && !!customer?.id && isOpen
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema)
  })

  useEffect(() => {
    if (customer) {
      reset({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || ''
      })
      setIsEditing(false)
    }
  }, [customer, reset, isOpen])

  const updateMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => crmService.updateCustomer(tenant!.id, customer!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-customers', tenant?.id] })
      setIsEditing(false)
    }
  })

  const onSubmit = (values: CustomerFormValues) => {
    updateMutation.mutate(values)
  }

  if (!customer) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-card p-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-card/80 backdrop-blur-xl z-10 flex items-center justify-between">
          <SheetTitle className="text-xl font-bold text-foreground">Detalles del Cliente</SheetTitle>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Profile */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-bold">
                {customer.first_name[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {customer.first_name} {customer.last_name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Registrado el {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Editar
              </button>
            )}
          </div>

          {/* Edit Form or View */}
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-foreground">Nombre</label>
                  <input {...register('first_name')} className="w-full px-3 py-2 bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400" />
                  {errors.first_name && <p className="text-xs text-rose-500">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-foreground">Apellido</label>
                  <input {...register('last_name')} className="w-full px-3 py-2 bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">Email</label>
                <input {...register('email')} type="email" className="w-full px-3 py-2 bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400" />
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground">Teléfono</label>
                <input {...register('phone')} className="w-full px-3 py-2 bg-card border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400" />
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:bg-zinc-900/50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-card border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{customer.email || 'No registrado'}</p>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-card border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Teléfono</p>
                  <p className="text-sm font-medium text-foreground truncate">{customer.phone || 'No registrado'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card shadow-sm flex flex-col justify-center items-center text-center">
              <ShoppingBag className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{customer.orders_count}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Pedidos Totales</p>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-xl font-serif text-purple-600 mb-2 font-bold">S/</span>
              <p className="text-2xl font-bold text-foreground">{Number(customer.total_spent).toFixed(2)}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Total Gastado</p>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h4 className="text-[15px] font-bold text-foreground mb-4 flex items-center gap-2">
              Historial de Pedidos 
              <span className="bg-zinc-100 dark:bg-zinc-800 text-muted-foreground text-xs py-0.5 px-2 rounded-full font-medium">
                {orders.length}
              </span>
            </h4>
            
            {isLoadingOrders ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 border-dashed">
                <p className="text-sm text-muted-foreground">Este cliente aún no tiene pedidos asociados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card hover:border-zinc-300 dark:border-zinc-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">Pedido #{order.id.slice(0,6)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">S/ {Number(order.total_amount).toFixed(2)}</p>
                        <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 
                            'bg-blue-50 text-blue-600'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        {order.order_items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                              {item.products?.product_images?.[0]?.public_url ? (
                                <img src={item.products.product_images[0].public_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground m-2" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-foreground truncate">
                                {item.quantity}x {item.products?.name || 'Producto eliminado'}
                              </p>
                            </div>
                            <p className="text-xs font-semibold text-muted-foreground shrink-0">
                              S/ {Number(item.total_price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
