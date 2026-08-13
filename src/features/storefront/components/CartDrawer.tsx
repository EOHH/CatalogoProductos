import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useStore } from '../providers/StoreProvider'

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalAmount, isOpen, setIsOpen } = useCart()
  const { tenant } = useStore()

  if (!isOpen) return null

  const handleCheckout = () => {
    const whatsappNumber = "51975991831" // In a real app, this should come from tenant settings
    
    let message = `¡Hola! Vengo de tu catálogo virtual y me gustaría realizar el siguiente pedido:\n\n`
    message += `🛍️ *MI PEDIDO:*\n`
    
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name}`
      if (item.variantName) message += ` (${item.variantName})`
      message += ` - S/ ${(item.price * item.quantity).toFixed(2)}\n`
    })
    
    message += `\n💰 *Total estimado:* S/ ${totalAmount.toFixed(2)}\n\n`
    message += `¿Tienen disponibilidad para procesar mi compra?`
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-[#fcf9f9]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-store-primary" />
            <h2 className="text-lg font-serif text-zinc-900">Tu Carrito</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <ShoppingBag className="w-16 h-16 text-zinc-300 mb-4" strokeWidth={1} />
              <p className="text-zinc-600 font-medium mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-zinc-400 max-w-[250px]">
                Agrega productos hermosos a tu carrito para continuar con la compra.
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-8 px-6 py-2.5 rounded-full border border-store-primary text-store-primary text-sm font-bold uppercase tracking-widest hover:bg-store-primary hover:text-white transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 relative group">
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Image */}
                  <div className="w-20 h-24 bg-zinc-200 rounded-xl overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">Sin imagen</div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 leading-tight mb-1">{item.name}</h3>
                      {item.variantName && (
                        <p className="text-xs text-zinc-500 mb-2">Opción: {item.variantName}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-store-primary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-zinc-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-store-primary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-store-primary text-sm">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-600 font-medium">Total Estimado</span>
              <span className="text-2xl font-bold text-zinc-900">S/ {totalAmount.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-store-primary hover:bg-store-primary/90 text-white rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Finalizar Pedido por WhatsApp
            </button>
            <p className="text-center text-[10px] text-zinc-400 mt-4">
              El costo de envío se coordinará por WhatsApp.
            </p>
          </div>
        )}

      </div>
    </>
  )
}
