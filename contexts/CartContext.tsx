'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type CartItem = {
  id: string
  databaseId: number
  slug: string
  name: string
  image?: string
  price: string
  size?: string
  color?: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, size: string | undefined, color: string | undefined, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: string
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function itemKey(id: string, size?: string, color?: string) {
  return `${id}__${size ?? ''}__${color ?? ''}`
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jaleca-cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('jaleca-cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const key = itemKey(newItem.id, newItem.size, newItem.color)
      const exists = prev.find(i => itemKey(i.id, i.size, i.color) === key)
      if (exists) {
        return prev.map(i =>
          itemKey(i.id, i.size, i.color) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string, size?: string, color?: string) => {
    const key = itemKey(id, size, color)
    setItems(prev => prev.filter(i => itemKey(i.id, i.size, i.color) !== key))
  }, [])

  const updateQuantity = useCallback((id: string, size: string | undefined, color: string | undefined, quantity: number) => {
    const key = itemKey(id, size, color)
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => itemKey(i.id, i.size, i.color) !== key))
    } else {
      setItems(prev =>
        prev.map(i => itemKey(i.id, i.size, i.color) === key ? { ...i, quantity } : i)
      )
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = formatPrice(
    items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0)
  )

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice, isOpen, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
