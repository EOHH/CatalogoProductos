import { useState } from 'react'
import { X, Minus, Plus, Trash2, ShoppingCart, Loader2, ArrowRight } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useStore } from '../providers/StoreProvider'
import { getWhatsAppUrl } from '@/utils/whatsapp'
import { checkoutService } from '../services/checkout.service'
import { toast } from 'sonner'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalAmount, isOpen, setIsOpen, clearCart } = useCart()
  const { settings, tenant } = useStore()

  // Checkout State
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  if (!isOpen) return null

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tenant?.id) {
      toast.error('Error de conexión con la tienda.')
      return
    }

    if (!firstName.trim() || !phone.trim()) {
      toast.error('Por favor, completa los campos requeridos (Nombre y Celular).')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Process Checkout in Supabase (Customers, Orders, Order_Items)
      const orderId = await checkoutService.processCheckout(
        tenant.id,
        { first_name: firstName, last_name: lastName, phone: phone },
        items.map(i => ({
          product_id: i.productId,
          quantity: i.quantity,
          unit_price: i.price
        })),
        totalAmount,
        'Pedido generado desde el catálogo virtual.'
      )

      // 2. Clear the cart
      clearCart()

      // 3. Generate WhatsApp Message
      let message = `¡Hola! Acabo de registrar un pedido en su tienda.\n`
      message += `*Mi nombre:* ${firstName} ${lastName}\n`
      message += `*ID del Pedido:* #${orderId.slice(0, 8).toUpperCase()}\n\n`
      message += `🛍️ *MI PEDIDO:*\n`

      items.forEach(item => {
        message += `- ${item.quantity}x ${item.name}`
        if (item.variantName) message += ` (${item.variantName})`
        message += ` - S/ ${(item.price * item.quantity).toFixed(2)}\n`
      })

      message += `\n💰 *Total estimado:* S/ ${totalAmount.toFixed(2)}\n\n`
      message += `Por favor, confírmenme para coordinar el envío/pago.`

      const url = getWhatsAppUrl(settings?.phone, message)

      // 4. Reset states & close drawer
      setIsCheckingOut(false)
      setFirstName('')
      setLastName('')
      setPhone('')
      setIsOpen(false)

      // 5. Open WhatsApp
      if (url) {
        window.open(url, '_blank')
      } else {
        toast.success('¡Pedido registrado con éxito!')
      }

    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al procesar el pedido. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasPhone = !!getWhatsAppUrl(settings?.phone)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
        onClick={() => !isSubmitting && setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-sans">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-card border-b border-zinc-100 dark:border-zinc-800 z-10 shadow-sm relative">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-store-primary" />
            <h2 className="text-lg font-serif text-foreground">Tu Carrito</h2>
          </div>
          <button
            onClick={() => !isSubmitting && setIsOpen(false)}
            disabled={isSubmitting}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:bg-zinc-900/50 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">

          {/* VIEW: Empty Cart */}
          {!isCheckingOut && items.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-card opacity-80">
              <ShoppingCart className="w-16 h-16 text-zinc-200 mb-6" strokeWidth={1} />
              <p className="text-lg font-serif text-foreground mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Agrega productos hermosos a tu carrito para continuar con la compra.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-8 px-8 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-muted-foreground text-[11px] font-bold uppercase tracking-widest hover:border-store-primary hover:text-store-primary hover:bg-store-primary/5 transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          )}

          {/* VIEW: Cart Items */}
          {!isCheckingOut && items.length > 0 && (
            <div className="p-6 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative group hover:border-zinc-200 dark:border-zinc-800 transition-colors">

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-card rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Image */}
                  <div className="w-20 h-24 bg-card rounded-xl overflow-hidden flex-shrink-0 border border-zinc-50 p-2">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sin imagen</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight mb-1 pr-4">{item.name}</h3>
                      {item.variantName && (
                        <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Opción: {item.variantName}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-background">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-store-primary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-store-primary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-store-primary text-[15px]">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW: Checkout Form Modal */}
          {isCheckingOut && (
            <div className="p-6 h-full flex flex-col bg-card">
              <button
                onClick={() => setIsCheckingOut(false)}
                className="self-start text-[11px] font-bold text-muted-foreground hover:text-store-primary uppercase tracking-widest flex items-center gap-2 mb-8"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Volver al carrito
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-serif text-foreground mb-2">Tus Datos</h3>
                <p className="text-sm text-muted-foreground">
                  Por favor, ingresa tus datos para registrar tu pedido de <span className="font-bold text-foreground">S/ {totalAmount.toFixed(2)}</span>.
                </p>
              </div>

              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase tracking-widest mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Daren"
                    disabled={isSubmitting}
                    className="w-full bg-background border border-zinc-200 dark:border-zinc-800 text-foreground text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase tracking-widest mb-2">
                    Apellido <span className="text-muted-foreground font-normal lowercase tracking-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Store"
                    disabled={isSubmitting}
                    className="w-full bg-background border border-zinc-200 dark:border-zinc-800 text-foreground text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase tracking-widest mb-2">
                    Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +51 987 654 321"
                    disabled={isSubmitting}
                    className="w-full bg-background border border-zinc-200 dark:border-zinc-800 text-foreground text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-store-primary/20 focus:border-store-primary transition-all disabled:opacity-60"
                  />
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer / Checkout Button */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 p-6 bg-card z-10 shadow-[0_-10px_30px_rgb(0,0,0,0.03)]">
            {!isCheckingOut ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground text-sm font-medium">Total Estimado</span>
                  <span className="text-2xl font-bold text-foreground tracking-tight">S/ {totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  disabled={!hasPhone}
                  className={`w-full text-white rounded-xl py-4.5 h-[56px] text-xs font-bold uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 ${hasPhone
                      ? 'bg-zinc-900 hover:bg-zinc-800 hover:-translate-y-0.5'
                      : 'bg-zinc-300 cursor-not-allowed opacity-70 shadow-none'
                    }`}
                  style={hasPhone && tenant?.primary_color ? { backgroundColor: tenant.primary_color, boxShadow: `0 8px 20px ${tenant.primary_color}40` } : undefined}
                >
                  {hasPhone ? 'Continuar Compra' : 'Tienda Cerrada'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !hasPhone}
                className={`w-full text-white rounded-xl py-4.5 h-[56px] text-xs font-bold uppercase tracking-widest transition-all shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center justify-center gap-2 ${!isSubmitting && hasPhone
                    ? 'bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(22,163,74,0.3)]'
                    : 'bg-green-600/60 cursor-wait shadow-none'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar y Enviar WhatsApp'
                )}
              </button>
            )}

            {!isCheckingOut && (
              <p className="text-center text-[10px] text-muted-foreground mt-5 tracking-wide">
                El costo de envío se coordinará de manera personalizada.
              </p>
            )}
          </div>
        )}

      </div>
    </>
  )
}
