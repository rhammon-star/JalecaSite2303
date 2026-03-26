'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { WooProduct } from '@/components/ProductCard'

const MAX_COMPARE = 3

type CompareContextType = {
  products: WooProduct[]
  addToCompare: (product: WooProduct) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean
}

const CompareContext = createContext<CompareContextType | null>(null)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<WooProduct[]>([])

  // Persist in sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('jaleca-compare')
      if (saved) setProducts(JSON.parse(saved) as WooProduct[])
    } catch {}
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem('jaleca-compare', JSON.stringify(products))
    } catch {}
  }, [products])

  const addToCompare = useCallback((product: WooProduct) => {
    setProducts(prev => {
      if (prev.length >= MAX_COMPARE) return prev
      if (prev.some(p => p.id === product.id)) return prev
      return [...prev, product]
    })
  }, [])

  const removeFromCompare = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
  }, [])

  const clearCompare = useCallback(() => setProducts([]), [])

  const isInCompare = useCallback(
    (productId: string) => products.some(p => p.id === productId),
    [products]
  )

  return (
    <CompareContext.Provider value={{ products, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
