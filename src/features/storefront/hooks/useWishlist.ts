import { useState, useEffect } from 'react'

const WISHLIST_STORAGE_KEY = 'tienda_premium_wishlist'

// Global state para compartir entre todos los componentes
let globalWishlist: string[] = []
let listeners: ((wishlist: string[]) => void)[] = []

// Carga inicial
try {
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
  if (stored) {
    globalWishlist = JSON.parse(stored)
  }
} catch (error) {
  console.error('Error loading wishlist from local storage', error)
}

const emitChange = () => {
  listeners.forEach(listener => listener([...globalWishlist]))
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(globalWishlist))
  } catch (error) {
    console.error('Error saving wishlist to local storage', error)
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(globalWishlist)

  useEffect(() => {
    listeners.push(setWishlist)
    return () => {
      listeners = listeners.filter(l => l !== setWishlist)
    }
  }, [])

  const toggleWishlist = (productId: string) => {
    if (globalWishlist.includes(productId)) {
      globalWishlist = globalWishlist.filter(id => id !== productId)
    } else {
      globalWishlist = [...globalWishlist, productId]
    }
    emitChange()
  }

  const syncWithProducts = (validIds: string[]) => {
    const filtered = globalWishlist.filter(id => validIds.includes(id))
    if (filtered.length !== globalWishlist.length) {
      globalWishlist = filtered
      emitChange()
    }
  }

  const isInWishlist = (productId: string) => wishlist.includes(productId)

  return { wishlist, toggleWishlist, isInWishlist, syncWithProducts }
}
