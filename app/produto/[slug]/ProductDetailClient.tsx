'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, ChevronLeft, Ruler } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import SizeAdvisorModal from '@/components/SizeAdvisorModal'

type AttributeTerm = { slug: string; name: string }

type Variation = {
  id: string
  name: string
  stockStatus: string
  price?: string
  regularPrice?: string
  salePrice?: string
  attributes: {
    nodes: Array<{ name: string; value: string; label?: string }>
  }
}

type Attribute = {
  name: string
  options: string[]
  terms?: { nodes: AttributeTerm[] }
}

type GalleryImage = {
  sourceUrl: string
  altText: string
}

type Product = {
  id: string
  databaseId: number
  name: string
  slug: string
  description?: string
  price?: string
  regularPrice?: string
  salePrice?: string
  stockStatus?: string
  image?: { sourceUrl: string; altText: string }
  galleryImages?: { nodes: GalleryImage[] }
  attributes?: { nodes: Attribute[] }
  variations?: { nodes: Variation[] }
}

// Build a slug → display name map from attribute terms
function buildSlugMap(attr: Attribute | undefined): Record<string, string> {
  const map: Record<string, string> = {}
  attr?.terms?.nodes.forEach(t => { map[t.slug] = t.name })
  return map
}

// Identify the color/size attribute from a list of attributes
function isColorAttr(a: { name: string; label?: string }) {
  return a.name === 'pa_color' || a.name.includes('color') || a.name.includes('cor') || a.label === 'color'
}
function isSizeAttr(a: { name: string; label?: string }) {
  return a.name === 'pa_tamanho' || a.name.includes('tamanho') || a.name.includes('size') || a.label === 'tamanho'
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize]   = useState<string | null>(null)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showAdvisor, setShowAdvisor]     = useState(false)

  // Find color and size attributes
  const colorAttrDef = product.attributes?.nodes.find(a => isColorAttr(a))
  const sizeAttrDef  = product.attributes?.nodes.find(a => isSizeAttr(a))

  // Slug → display name maps (from terms, fall back to slug itself)
  const colorNames = buildSlugMap(colorAttrDef)
  const sizeNames  = buildSlugMap(sizeAttrDef)

  const colorSlugs = colorAttrDef?.options ?? []
  const sizeSlugs  = sizeAttrDef?.options  ?? []

  // Match the variation only when at least one attribute is selected.
  // Variation attribute value "" means "any" in WooCommerce.
  const matchedVariation = (selectedColor || selectedSize)
    ? product.variations?.nodes.find(v => {
        const attrs = v.attributes.nodes
        const vColor = attrs.find(a => isColorAttr(a))
        const vSize  = attrs.find(a => isSizeAttr(a))
        const colorMatch = !selectedColor || !vColor || vColor.value === '' || vColor.value === selectedColor
        const sizeMatch  = !selectedSize  || !vSize  || vSize.value  === '' || vSize.value  === selectedSize
        return colorMatch && sizeMatch
      })
    : undefined

  // Price: use matched variation when one exists, else show parent product price (may be a range)
  const activePrice   = matchedVariation?.price       ?? product.price       ?? product.regularPrice ?? ''
  const activeRegular = matchedVariation?.regularPrice ?? (selectedColor || selectedSize ? product.regularPrice : undefined)
  const activeSale    = matchedVariation?.salePrice    ?? (selectedColor || selectedSize ? product.salePrice    : undefined)
  const isOnSale      = !!(activeSale && activeRegular && activeSale !== activeRegular)
  const displayPrice  = isOnSale ? activeSale! : activePrice

  const canAdd = (colorSlugs.length === 0 || selectedColor) && (sizeSlugs.length === 0 || selectedSize)
  const { addItem } = useCart()

  function handleAddToCart() {
    if (!canAdd) return
    const colorLabel = selectedColor ? (colorNames[selectedColor] ?? selectedColor) : undefined
    const sizeLabel  = selectedSize  ? (sizeNames[selectedSize]   ?? selectedSize.toUpperCase()) : undefined
    addItem({
      id: product.id,
      databaseId: product.databaseId,
      slug: product.slug,
      name: product.name.replace(/ - Jaleca$/i, ''),
      image: product.image?.sourceUrl,
      price: displayPrice,
      size: sizeLabel,
      color: colorLabel,
    })
  }

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  return (
    <>
    <main className="py-8 md:py-12">
      <div className="container">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Voltar
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 md:gap-16 lg:gap-20 items-start">
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden rounded-[28px] bg-secondary/20 ring-1 ring-secondary/30">
            {product.image?.sourceUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image.sourceUrl}
                alt={product.image.altText || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Sem imagem
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col md:pt-4">
            <p className="text-[11px] text-primary tracking-[0.28em] uppercase mb-3">Jaleca</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-[-0.03em] mb-5 text-balance">
              {product.name.replace(/ - Jaleca$/i, '')}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl md:text-[2rem] font-semibold tabular-nums">
                {displayPrice}
              </span>
              {isOnSale && activeRegular && (
                <span className="text-base text-muted-foreground line-through tabular-nums">{activeRegular}</span>
              )}
            </div>

            {product.description && (
              <p className="max-w-[52ch] text-sm md:text-[15px] text-muted-foreground leading-relaxed mb-8 text-pretty">
                {stripHtml(product.description)}
              </p>
            )}

            <div className="border-y border-border/80 py-6 mb-8">
              <button
                onClick={() => setShowAdvisor(true)}
                className="inline-flex w-full min-h-12 items-center justify-center border border-secondary bg-background px-6 py-4 text-xs font-semibold tracking-widest uppercase text-secondary transition-all duration-300 hover:bg-secondary hover:text-background active:scale-[0.98] rounded-none"
              >
                Descubra seu Tamanho Ideal
              </button>
            </div>

            {/* Color selector */}
            {colorSlugs.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                  Cor{selectedColor ? `: ${colorNames[selectedColor] ?? selectedColor}` : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorSlugs.map(slug => {
                    const label = colorNames[slug] ?? slug
                    const isActive = selectedColor === slug
                    return (
                      <button
                        key={slug}
                        onClick={() => setSelectedColor(isActive ? null : slug)}
                        className={`filter-chip min-h-12 px-4 py-2 text-xs font-medium tracking-wide uppercase ${isActive ? 'filter-chip--active' : ''}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizeSlugs.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Tamanho{selectedSize ? `: ${sizeNames[selectedSize] ?? selectedSize.toUpperCase()}` : ''}
                  </p>
                  <button
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4"
                  >
                    <Ruler size={12} /> Tabela de medidas
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeSlugs.map(slug => {
                    const label = sizeNames[slug] ?? slug.toUpperCase()
                    const isActive = selectedSize === slug
                    return (
                      <button
                        key={slug}
                        onClick={() => setSelectedSize(isActive ? null : slug)}
                        className={`filter-chip flex h-12 w-12 items-center justify-center text-xs font-medium tracking-wide uppercase ${isActive ? 'filter-chip--active' : ''}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Inline size chart */}
            {showSizeChart && (
              <div className="mb-8 overflow-hidden rounded-3xl border border-border animate-fade-in">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="py-2 px-3 text-left font-semibold">Tam.</th>
                      <th className="py-2 px-3 text-left font-semibold">Busto</th>
                      <th className="py-2 px-3 text-left font-semibold">Cintura</th>
                      <th className="py-2 px-3 text-left font-semibold">Quadril</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: 'PP', busto: '82-86', cintura: '64-68', quadril: '88-92' },
                      { size: 'P',  busto: '86-90', cintura: '68-72', quadril: '92-96' },
                      { size: 'M',  busto: '90-94', cintura: '72-76', quadril: '96-100' },
                      { size: 'G',  busto: '94-100', cintura: '76-82', quadril: '100-106' },
                      { size: 'GG', busto: '100-106', cintura: '82-88', quadril: '106-112' },
                      { size: 'XGG', busto: '106-112', cintura: '88-94', quadril: '112-118' },
                    ].map(row => (
                      <tr key={row.size} className="border-t border-border">
                        <td className="py-2 px-3 font-medium">{row.size}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.busto}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.cintura}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.quadril}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 inline-flex min-h-14 w-full items-center justify-center gap-2 bg-ink px-6 py-4 text-xs font-semibold tracking-widest uppercase text-background transition-transform duration-300 hover:bg-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canAdd}
              >
                <ShoppingBag size={18} />
                Adicionar à Sacola
              </button>
              <button
                className="h-14 w-14 rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted active:scale-95 flex items-center justify-center"
                aria-label="Favoritar"
              >
                <Heart size={20} />
              </button>
            </div>
            {!canAdd && (colorSlugs.length > 0 || sizeSlugs.length > 0) && (
              <p className="text-xs text-muted-foreground mt-2">
                Selecione {colorSlugs.length > 0 && sizeSlugs.length > 0 ? 'cor e tamanho' : colorSlugs.length > 0 ? 'a cor' : 'o tamanho'} para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </main>

    {showAdvisor && (
      <SizeAdvisorModal
        productName={product.name.replace(/ - Jaleca$/i, '')}
        onClose={() => setShowAdvisor(false)}
      />
    )}
    </>
  )
}
