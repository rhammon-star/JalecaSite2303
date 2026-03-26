'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X } from 'lucide-react'
import { useCompare } from '@/contexts/CompareContext'

export default function CompareBar() {
  const { products, removeFromCompare, clearCompare } = useCompare()

  if (products.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-background border-t border-border shadow-xl safe-bottom">
      <div className="container flex items-center gap-2 sm:gap-4 py-3 px-3 sm:px-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground hidden sm:block">
          Comparar ({products.length}/3)
        </span>

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {products.map(product => (
            <div key={product.id} className="relative flex-shrink-0 w-16 h-20 border border-border bg-secondary/10">
              {product.image?.sourceUrl ? (
                <Image
                  src={product.image.sourceUrl}
                  alt={product.image.altText || product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
              <button
                onClick={() => removeFromCompare(product.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background flex items-center justify-center"
                aria-label={`Remover ${product.name}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-shrink-0 w-16 h-20 border border-dashed border-border flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">+</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Limpar
          </button>
          <Link
            href="/comparar"
            className="bg-foreground text-background px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors"
          >
            Comparar
          </Link>
        </div>
      </div>
    </div>
  )
}
