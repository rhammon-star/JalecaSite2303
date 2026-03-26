'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type WishlistContextType = {
  items: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
}

const WishlistContext = createContext<WishlistContextType | null>(null)

const STORAGE_KEY = 'jaleca-wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToWishlist = useCallback((productId: string) => {
    setItems(prev => prev.includes(productId) ? prev : [...prev, productId])
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(id => id !== productId))
  }, [])

  const isInWishlist = useCallback((productId: string) => {
    return items.includes(productId)
  }, [items])

  const toggleWishlist = useCallback((productId: string) => {
    setItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [])

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
