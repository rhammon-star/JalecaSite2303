'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import ShippingCalculator, { type ShippingOption } from '@/components/ShippingCalculator'
import Link from 'next/link'

type CouponData = {
  code: string
  discount_type: string
  amount: string
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, closeCart } = useCart()
  const pathname = usePathname()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)

  // Close cart when navigating to a different page
  useEffect(() => {
    closeCart()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const subtotal = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0)

  function calcDiscount(): number {
    if (!appliedCoupon) return 0
    if (appliedCoupon.discount_type === 'percent') {
      return subtotal * (parseFloat(appliedCoupon.amount) / 100)
    }
    return parseFloat(appliedCoupon.amount) || 0
  }

  const discount = calcDiscount()
  const shippingCost = selectedShipping?.cost ?? 0
  const total = Math.max(0, subtotal - discount + shippingCost)

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Cupom inválido')
        return
      }
      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, amount: data.amount })
      setCouponCode('')
    } catch {
      setCouponError('Erro ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponError('')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full bg-background flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'min(420px, 100vw)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="font-display text-lg font-semibold">Sacola</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
            aria-label="Fechar sacola"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping progress bar */}
        {items.length > 0 && (() => {
          const FREE_SHIPPING_THRESHOLD = 299
          const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
          const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)
          return (
            <div className="px-6 py-3 bg-muted/30 border-b border-border">
              {remaining > 0 ? (
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Faltam <strong className="text-foreground">{formatCurrency(remaining)}</strong> para frete grátis
                </p>
              ) : (
                <p className="text-[11px] text-green-600 font-semibold mb-1.5">🎉 Frete grátis desbloqueado!</p>
              )}
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })()}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={40} className="text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">Sua sacola está vazia</p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-secondary/20">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground leading-tight mb-1 truncate">
                      {item.name}
                    </h4>
                    <div className="flex gap-2 mb-2">
                      {item.color && (
                        <span className="text-[11px] text-muted-foreground">{item.color}</span>
                      )}
                      {item.size && (
                        <span className="text-[11px] text-muted-foreground uppercase">{item.size}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mb-3">{item.price}</p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                        aria-label="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border space-y-4">
            {/* Coupon */}
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
                <Tag size={12} />
                Cupom de Desconto
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-xs text-green-700 font-medium uppercase">{appliedCoupon.code}</span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Remover cupom"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO"
                    className="flex-1 border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:border-foreground transition-colors uppercase"
                    onKeyDown={e => { if (e.key === 'Enter') handleApplyCoupon() }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 border border-border text-xs font-semibold hover:bg-secondary/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {couponLoading ? <Loader2 size={12} className="animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            </div>

            {/* Shipping calculator */}
            <ShippingCalculator
              onShippingSelected={setSelectedShipping}
              selectedId={selectedShipping?.id}
              onCepCalculated={cep => {
                try { localStorage.setItem('jaleca-checkout-cep', cep) } catch {}
              }}
            />

            {/* Price summary */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Desconto ({appliedCoupon.code})</span>
                  <span className="text-green-600">- {formatCurrency(discount)}</span>
                </div>
              )}
              {selectedShipping && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{selectedShipping.label}</span>
                  <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-background py-4 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98]"
            >
              <ShoppingBag size={16} />
              Finalizar Compra
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 text-center"
            >
              Limpar sacola
            </button>
          </div>
        )}
      </div>
    </>
  )
}
