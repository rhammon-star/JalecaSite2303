'use client'

import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

const WOOCOMMERCE_URL = 'https://jaleca.com.br'

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, closeCart } = useCart()

  function handleCheckout() {
    if (items.length === 0) return
    // Redirect to WooCommerce checkout
    window.location.href = `${WOOCOMMERCE_URL}/checkout/`
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
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-background flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
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
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus size={12} />
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">{totalPrice}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full inline-flex items-center justify-center gap-2 bg-ink text-background py-4 text-xs font-semibold tracking-widest uppercase transition-all hover:bg-ink/90 active:scale-[0.98]"
            >
              <ShoppingBag size={16} />
              Finalizar Compra
            </button>
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
