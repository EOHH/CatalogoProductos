import { useState, useEffect } from 'react'

export interface CartItem {
  id: string // A unique ID for the cart item (productId + variantId)
  productId: string
  name: string
  price: number
  quantity: number
  variantId?: string
  variantName?: string
  imageUrl?: string
  stock?: number
}

// Emulate a global store/event bus since we don't have Zustand/Redux for this specifically
// (A simple context could be better, but we can do a pub/sub or just use an exported hook that syncs with localStorage)
// Actually, it's better to use an event listener for storage/custom events to sync state across components,
// OR just lift state to StoreProvider. Since we have StoreProvider, it would be best to put it there.
// But wait, if I use a custom hook and dispatch a custom event, we can keep it decoupled!

const CART_EVENT = 'MILU_CART_UPDATED'
const CART_TOGGLE_EVENT = 'MILU_CART_TOGGLED'

export function useCart() {
  const [items, setItemsState] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('milu_cart')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  })

  const [isOpen, setIsOpenState] = useState(false)

  // Sync state between components (Nav and Drawer)
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('milu_cart')
      setItemsState(stored ? JSON.parse(stored) : [])
    }
    const handleToggle = (e: any) => {
      setIsOpenState(e.detail)
    }

    window.addEventListener(CART_EVENT, handleUpdate)
    window.addEventListener(CART_TOGGLE_EVENT, handleToggle)
    return () => {
      window.removeEventListener(CART_EVENT, handleUpdate)
      window.removeEventListener(CART_TOGGLE_EVENT, handleToggle)
    }
  }, [])

  const setItems = (newItems: CartItem[]) => {
    setItemsState(newItems)
    localStorage.setItem('milu_cart', JSON.stringify(newItems))
    window.dispatchEvent(new Event(CART_EVENT))
  }

  const setIsOpen = (open: boolean) => {
    setIsOpenState(open)
    window.dispatchEvent(new CustomEvent(CART_TOGGLE_EVENT, { detail: open }))
  }

  const addItem = (item: CartItem) => {
    const existing = items.find(i => i.id === item.id)
    if (existing) {
      setItems(items.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + item.quantity } 
          : i
      ))
    } else {
      setItems([...items, item])
    }
    setIsOpen(true) // Open drawer on add
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems(items.map(i => (i.id === id ? { ...i, quantity } : i)))
  }

  const clearCart = () => {
    setItems([])
  }

  const syncWithProducts = (validIds: string[]) => {
    const filtered = items.filter(i => validIds.includes(i.productId))
    if (filtered.length !== items.length) {
      setItems(filtered)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
    isOpen,
    setIsOpen,
    syncWithProducts
  }
}
