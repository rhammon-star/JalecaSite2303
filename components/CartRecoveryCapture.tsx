'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCart } from '@/contexts/CartContext'

const INACTIVITY_MS = 2 * 60 * 1000 // 2 minutes

export default function CartRecoveryCapture() {
  const { items } = useCart()
  const [showToast, setShowToast] = useState(false)
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownRef = useRef(false)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (items.length === 0 || shownRef.current) return
    timerRef.current = setTimeout(() => {
      setShowToast(true)
    }, INACTIVITY_MS)
  }, [items.length])

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resetTimer])

  // Hide if cart empties
  useEffect(() => {
    if (items.length === 0) setShowToast(false)
  }, [items.length])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/cart-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          cartItems: items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      })
      setSaved(true)
      shownRef.current = true
    } catch {
      // fail silently
    } finally {
      setLoading(false)
    }
  }

  function handleDismiss() {
    shownRef.current = true
    setShowToast(false)
  }

  if (!showToast) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-24 sm:w-80 z-[100] bg-background border border-border shadow-xl p-4">
      {!saved ? (
        <>
          <p className="text-sm font-medium mb-1">Esqueceu alguma coisa?</p>
          <p className="text-xs text-muted-foreground mb-3">
            Salve seu carrinho para comprar depois.
          </p>
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="flex-1 border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:border-foreground"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-foreground text-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wide disabled:opacity-60"
            >
              {loading ? '...' : 'Salvar'}
            </button>
          </form>
          <button
            onClick={handleDismiss}
            className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Dispensar
          </button>
        </>
      ) : (
        <div>
          <p className="text-sm font-medium mb-1">Carrinho salvo!</p>
          <p className="text-xs text-muted-foreground">
            Enviaremos um e-mail para você não perder nada.
          </p>
          <button
            onClick={() => setShowToast(false)}
            className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
