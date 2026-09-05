import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Minus, Search, ArrowLeft, Loader2, Package } from 'lucide-react'
import { useTenant } from '@/features/core/TenantProvider'
import { crmService } from '../dashboard/services/crm.service'
import { catalogService } from '../storefront/services/catalog.service'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import type { PublicProduct } from '@/types/catalog'

export function NewOrder() {
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [customerInfo, setCustomerInfo] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Array<{ product: PublicProduct, quantity: number }>>([])

  // Fetch products for autocomplete
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['products-search', tenant?.id, searchQuery],
    queryFn: () => catalogService.searchProducts(tenant!.id, searchQuery),
    enabled: !!tenant?.id && searchQuery.length >= 2
  })

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!tenant) throw new Error('No tenant')
      
      // 1. Create or get customer (Simplified for this version, always creates new)
      const customer = await crmService.createCustomer({
        tenant_id: tenant.id,
        ...customerInfo,
        total_spent: 0,
        orders_count: 0
      })

      // 2. Prepare Order Items
      const totalAmount = selectedProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

      const orderItems = selectedProducts.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        order_id: '' // Will be filled by service
      }))

      // 3. Create Order
      await crmService.createOrder({
        tenant_id: tenant.id,
        customer_id: customer.id,
        status: 'pending',
        total_amount: totalAmount,
        notes: 'Pedido manual vía WhatsApp'
      }, orderItems)
    },
    onSuccess: () => {
      toast.success('Pedido creado correctamente')
      queryClient.invalidateQueries({ queryKey: ['crm-orders', tenant?.id] })
      navigate('/dashboard/orders')
    },
    onError: (err) => {
      console.error(err)
      toast.error('Error al crear el pedido')
    }
  })

  const addProduct = (product: PublicProduct) => {
    if (selectedProducts.find(p => p.product.id === product.id)) {
      toast.error('El producto ya está en la lista')
      return
    }
    setSelectedProducts([...selectedProducts, { product, quantity: 1 }])
    setSearchQuery('')
  }

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedProducts(current => current.map(item => {
      if (item.product.id === productId) {
        const newQ = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQ }
      }
      return item
    }))
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(current => current.filter(item => item.product.id !== productId))
  }

  const total = selectedProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const isFormValid = customerInfo.first_name && selectedProducts.length > 0

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/orders" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nuevo Pedido Manual</h1>
          <p className="text-muted-foreground mt-1">Registra una venta cerrada por WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Datos del Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nombre *</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-400 focus:bg-card transition-all text-sm"
                  placeholder="Ej. María"
                  value={customerInfo.first_name}
                  onChange={e => setCustomerInfo({...customerInfo, first_name: e.target.value})}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Apellido</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-400 focus:bg-card transition-all text-sm"
                  placeholder="Ej. García"
                  value={customerInfo.last_name}
                  onChange={e => setCustomerInfo({...customerInfo, last_name: e.target.value})}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">WhatsApp *</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 outline-none focus:border-zinc-400 focus:bg-card transition-all text-sm"
                  placeholder="Ej. +51 987 654 321"
                  value={customerInfo.phone}
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-card p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Productos Vendidos</h2>
            
            {/* Search Autocomplete */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 outline-none focus:border-zinc-400 focus:bg-card transition-all text-sm"
                placeholder="Busca productos por nombre para agregarlos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Autocomplete Results */}
              {searchQuery.length >= 2 && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-card rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                  {searchResults.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-50 last:border-0 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">S/ {Number(product.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Products */}
            <div className="space-y-3">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-muted-foreground">No hay productos seleccionados.</p>
                </div>
              ) : (
                selectedProducts.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-card border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded object-cover">
                        <Package className="w-6 h-6 m-3 text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs font-medium text-muted-foreground">S/ {Number(product.price).toFixed(2)} cada uno</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-card rounded">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-card rounded">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeProduct(product.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="bg-zinc-900 text-white p-6 rounded-2xl sticky top-24">
            <h2 className="text-lg font-bold mb-6">Resumen</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span>Pendiente</span>
              </div>
              <div className="border-t border-zinc-700 pt-4 flex justify-between">
                <span className="font-bold">Total a registrar</span>
                <span className="font-bold text-lg">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => createOrderMutation.mutate()}
              disabled={!isFormValid || createOrderMutation.isPending}
              className="w-full bg-card text-foreground font-bold py-3 px-4 rounded-xl hover:bg-zinc-100 dark:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {createOrderMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Crear Pedido Manual'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
