'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ImageZoom from '@/components/ImageZoom'
import Breadcrumb from '@/components/Breadcrumb'
import { ShoppingBag, Heart, ChevronLeft, Ruler, Star, Loader2, CreditCard, Banknote, MessageCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import SizeAdvisorModal from '@/components/SizeAdvisorModal'
import BackInStockButton from '@/components/BackInStockButton'
import { graphqlClient, GET_RELATED_PRODUCTS } from '@/lib/graphql'
import ProductCard, { type WooProduct } from '@/components/ProductCard'

type AttributeTerm = { slug: string; name: string }

type VariationImage = {
  sourceUrl: string
  altText: string
}

type Variation = {
  id: string
  databaseId: number
  name: string
  stockStatus: string
  price?: string
  regularPrice?: string
  salePrice?: string
  sku?: string
  image?: VariationImage
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

type ProductCategory = {
  id: string
  name: string
  slug: string
}

type Product = {
  id: string
  databaseId: number
  name: string
  slug: string
  description?: string
  shortDescription?: string
  sku?: string
  price?: string
  regularPrice?: string
  salePrice?: string
  stockStatus?: string
  image?: { sourceUrl: string; altText: string }
  galleryImages?: { nodes: GalleryImage[] }
  attributes?: { nodes: Attribute[] }
  variations?: { nodes: Variation[] }
  productCategories?: { nodes: ProductCategory[] }
}

type Review = {
  id: number
  reviewer: string
  review: string
  rating: number
  date_created: string
  verified: boolean
}

type ActiveTab = 'dados-tecnicos' | 'informacoes' | 'avaliacoes'

// Build a slug → display name map from attribute terms
function buildSlugMap(attr: Attribute | undefined): Record<string, string> {
  const map: Record<string, string> = {}
  attr?.terms?.nodes.forEach(t => { map[t.slug] = t.name })
  return map
}

function isColorAttr(a: { name: string; label?: string }) {
  const n = a.name.toLowerCase()
  const l = (a.label ?? '').toLowerCase()
  return n === 'pa_color' || n === 'pa_cor' || n.includes('color') || n.includes('cor') || n.includes('estampa') || l.includes('cor') || l.includes('estampa')
}
function isSizeAttr(a: { name: string; label?: string }) {
  const n = a.name.toLowerCase()
  const l = (a.label ?? '').toLowerCase()
  return n === 'pa_tamanho' || n.includes('tamanho') || n.includes('size') || l.includes('tamanho') || l.includes('size')
}

function StockBadge({ status }: { status?: string }) {
  if (!status) return null
  if (status === 'IN_STOCK') {
    return <span className="text-xs text-green-600 font-medium">Em estoque</span>
  }
  if (status === 'OUT_OF_STOCK') {
    return <span className="text-xs text-red-600 font-medium">Esgotado</span>
  }
  if (status === 'ON_BACKORDER') {
    return <span className="text-xs text-yellow-600 font-medium">Últimas unidades</span>
  }
  return null
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 fill-muted-foreground/10'}
        />
      ))}
    </div>
  )
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Clean WPBakery and other shortcodes from HTML
function cleanHtml(html: string): string {
  return html
    .replace(/\[\/?\w+[^\]]*\]/g, '') // Remove [shortcode] and [/shortcode]
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim()
}

// Format technical content: bold uppercase words, separators, clean structure
function formatTechnicalContent(html: string): string {
  const cleaned = cleanHtml(html)

  // Split into HTML tags and text nodes — only process text nodes
  const parts = cleaned.split(/(<[^>]+>)/)
  const processed = parts.map(part => {
    if (part.startsWith('<')) return part
    // Bold sequences of 3+ uppercase letters (including accented Portuguese chars)
    return part.replace(
      /([A-ZÁÉÍÓÚÃÊÇÂÔÀÜÕ]{3,}(?:[\s\-\/][A-ZÁÉÍÓÚÃÊÇÂÔÀÜÕ\d]{2,})*)/g,
      '<strong>$1</strong>'
    )
  })

  let result = processed.join('')

  // Convert plain line-breaks to paragraphs if no block tags present
  if (!/<(p|ul|ol|h[1-6]|div|br)/i.test(result)) {
    result = result
      .split(/\n{2,}/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => `<p>${s.replace(/\n/g, '<br/>')}</p>`)
      .join('')
  }

  // Inject decorative separator between every <p> block
  const SEPARATOR = `<div class="tech-separator"><span></span><span class="tech-dot">✦</span><span></span></div>`
  result = result.replace(/<\/p>\s*<p>/g, `</p>${SEPARATOR}<p>`)

  // Also inject separator between </li></ul> and next <p>, or between </p> and <ul>
  result = result.replace(/<\/ul>\s*<p>/g, `</ul>${SEPARATOR}<p>`)
  result = result.replace(/<\/p>\s*<ul>/g, `</p>${SEPARATOR}<ul>`)

  return result
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}


export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize]   = useState<string | null>(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showAdvisor, setShowAdvisor]     = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('dados-tecnicos')

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Variation galleries: databaseId → images[]
  const [variationGalleries, setVariationGalleries] = useState<Record<number, GalleryImage[]>>({})

  // Related products
  const [related, setRelated] = useState<WooProduct[]>([])

  const { user } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const inWishlist = isInWishlist(product.id)

  // Find color and size attributes
  const colorAttrDef = product.attributes?.nodes.find(a => isColorAttr(a))
  const sizeAttrDef  = product.attributes?.nodes.find(a => isSizeAttr(a))

  const colorNames = buildSlugMap(colorAttrDef)
  const sizeNames  = buildSlugMap(sizeAttrDef)

  const colorSlugs = colorAttrDef?.options ?? []
  const sizeSlugs  = sizeAttrDef?.options  ?? []

  // Only match a variation when ALL present attributes are selected to avoid wrong prices
  const allAttrsSelected =
    (colorSlugs.length === 0 || !!selectedColor) &&
    (sizeSlugs.length  === 0 || !!selectedSize)

  const matchedVariation = allAttrsSelected && (selectedColor || selectedSize)
    ? product.variations?.nodes.find(v => {
        const attrs = v.attributes.nodes
        const vColor = attrs.find(a => isColorAttr(a))
        const vSize  = attrs.find(a => isSizeAttr(a))
        // WooCommerce GraphQL inconsistency: options returns slugs but variation value returns term NAME
        // So compare case-insensitively and also against the term display name
        const selectedColorName = selectedColor ? (colorNames[selectedColor] ?? selectedColor) : null
        const selectedSizeName  = selectedSize  ? (sizeNames[selectedSize]  ?? selectedSize)  : null
        const colorMatch = !selectedColor || !vColor || vColor.value === '' ||
          vColor.value.toLowerCase() === selectedColor.toLowerCase() ||
          (selectedColorName && vColor.value.toLowerCase() === selectedColorName.toLowerCase())
        const sizeMatch = !selectedSize || !vSize || vSize.value === '' ||
          vSize.value.toLowerCase() === selectedSize.toLowerCase() ||
          (selectedSizeName && vSize.value.toLowerCase() === selectedSizeName.toLowerCase())
        return colorMatch && sizeMatch
      })
    : undefined

  // Before any selection: show regularPrice range (no promos). After match: show variation price.
  const activePrice   = matchedVariation?.price ?? (product.regularPrice ?? product.price ?? '')
  const activeRegular = matchedVariation?.regularPrice
  const activeSale    = matchedVariation?.salePrice
  const isOnSale      = !!(activeSale && activeRegular && activeSale !== activeRegular)
  const displayPrice  = isOnSale ? activeSale! : activePrice

  const stockStatus = matchedVariation?.stockStatus ?? product.stockStatus
  const isOutOfStock = stockStatus === 'OUT_OF_STOCK'

  // Build gallery: use variation gallery if available, otherwise product gallery
  const galleryNodes = product.galleryImages?.nodes ?? []
  const varGallery = matchedVariation?.databaseId ? (variationGalleries[matchedVariation.databaseId] ?? []) : []
  const baseImage = matchedVariation?.image?.sourceUrl ? matchedVariation.image : product.image

  const allImages = varGallery.length > 0
    ? varGallery  // variation has its own gallery → use it entirely
    : baseImage
      ? [baseImage, ...galleryNodes.filter(g => g.sourceUrl !== baseImage.sourceUrl)]
      : galleryNodes

  const displayImage = allImages[activeImageIdx] ?? baseImage

  // Reset to first image when variation changes
  const prevMatchedId = matchedVariation?.id
  useEffect(() => { setActiveImageIdx(0) }, [prevMatchedId])

  const canAdd = (colorSlugs.length === 0 || selectedColor) &&
    (sizeSlugs.length === 0 || selectedSize) &&
    !isOutOfStock

  const { addItem } = useCart()

  // Price calculations for PIX and installments
  const priceValue = parsePrice(displayPrice)
  const pixPrice = priceValue * 0.95
  const installmentValue = priceValue > 0 ? priceValue / 3 : 0

  function handleAddToCart() {
    if (!canAdd) return
    const colorLabel = selectedColor ? (colorNames[selectedColor] ?? selectedColor) : undefined
    const sizeLabel  = selectedSize  ? (sizeNames[selectedSize]   ?? selectedSize.toUpperCase()) : undefined
    addItem({
      id: product.id,
      databaseId: product.databaseId,
      slug: product.slug,
      name: product.name.replace(/ - Jaleca$/i, ''),
      image: displayImage?.sourceUrl,
      price: displayPrice,
      size: sizeLabel,
      color: colorLabel,
    })
  }

  // Load reviews
  useEffect(() => {
    if (!product.databaseId) return
    setReviewsLoading(true)
    fetch(`/api/reviews/${product.databaseId}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [product.databaseId])

  // Prepopulate review form if logged in
  useEffect(() => {
    if (user) {
      setReviewName(user.name)
      setReviewEmail(user.email)
    }
  }, [user])


  // Load variation galleries
  useEffect(() => {
    if (!product.variations?.nodes.length) return
    fetch(`/api/variation-gallery?productId=${product.databaseId}`)
      .then(r => r.json())
      .then(data => setVariationGalleries(data))
      .catch(() => {})
  }, [product.databaseId, product.variations])

  // Load related products
  useEffect(() => {
    const categorySlug = product.productCategories?.nodes[0]?.slug
    if (!categorySlug) return
    graphqlClient
      .request<{ products: { nodes: WooProduct[] } }>(GET_RELATED_PRODUCTS, {
        categorySlug,
        first: 4,
      })
      .then(data => {
        const nodes = data.products.nodes.filter(p => p.id !== product.id).slice(0, 4)
        setRelated(nodes)
      })
      .catch(() => {})
  }, [product.id, product.productCategories])

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    setReviewError('')
    setReviewSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${product.databaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          review: reviewText,
          reviewer: reviewName,
          reviewer_email: reviewEmail,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setReviewError(err.error || 'Erro ao enviar avaliação')
        return
      }
      const newReview = await res.json()
      setReviews(prev => [newReview, ...prev])
      setReviewText('')
      setReviewRating(5)
      setReviewSuccess(true)
    } catch {
      setReviewError('Erro ao enviar avaliação')
    } finally {
      setReviewSubmitting(false)
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  // SKU: variation sku or product sku
  const displaySku = matchedVariation?.sku || product.sku

  // Attributes for "Informações Adicionais" tab
  const productAttributes = product.attributes?.nodes ?? []

  const productName = product.name.replace(/ - Jaleca$/i, '')
  const categoryNode = product.productCategories?.nodes[0]
  const whatsappText = encodeURIComponent(`Olá! Gostaria de tirar dúvidas sobre o produto: ${productName} (jaleca.com.br/produto/${product.slug})`)

  return (
    <>
    <main className="py-8 md:py-12">
      <div className="container">
        <Breadcrumb crumbs={[
          { label: 'Início', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          ...(categoryNode ? [{ label: categoryNode.name, href: `/produtos?cat=${categoryNode.name}` }] : []),
          { label: productName },
        ]} />

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8 md:gap-16 lg:gap-20 items-start">
          {/* Image gallery */}
          <div className="flex flex-col gap-3">
            {/* Main image with zoom */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-secondary/20 ring-1 ring-secondary/30"
                 title="Passe o mouse para ver os detalhes">
              {displayImage?.sourceUrl ? (
                <ImageZoom
                  key={displayImage.sourceUrl}
                  src={displayImage.sourceUrl}
                  alt={displayImage.altText || product.name}
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Sem imagem
                </div>
              )}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                  🔍 Zoom
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={img.sourceUrl}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`flex-shrink-0 w-16 h-20 relative overflow-hidden rounded-md border-2 transition-all duration-200 ${
                      activeImageIdx === idx
                        ? 'border-primary shadow-sm'
                        : 'border-border hover:border-foreground/40'
                    }`}
                  >
                    <Image
                      src={img.sourceUrl}
                      alt={img.altText || `${product.name} ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col md:pt-4">
            <p className="text-[11px] text-primary tracking-[0.28em] uppercase mb-1">Jaleca</p>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-[-0.03em] mb-2 text-balance">
              {product.name.replace(/ - Jaleca$/i, '')}
            </h1>

            {/* SKU */}
            {displaySku && (
              <p className="text-xs text-muted-foreground mb-3">Ref: {displaySku}</p>
            )}

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={Math.round(avgRating)} size={13} />
                <span className="text-xs text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} avaliações)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl md:text-[2rem] font-semibold tabular-nums">
                {displayPrice}
              </span>
              {isOnSale && activeRegular && (
                <span className="text-base text-muted-foreground line-through tabular-nums">{activeRegular}</span>
              )}
            </div>

            {/* PIX / Installments pricing */}
            {priceValue > 0 && (
              <div className="mb-3 space-y-0.5">
                {installmentValue > 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CreditCard size={13} />
                    3x de {formatCurrency(installmentValue)} sem juros
                  </p>
                )}
                {pixPrice > 0 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Banknote size={13} />
                    {formatCurrency(pixPrice)} no PIX (5% de desconto)
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <StockBadge status={stockStatus} />
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <div
                className="max-w-[52ch] text-sm md:text-[15px] text-muted-foreground leading-relaxed mb-8 text-pretty prose prose-sm"
                dangerouslySetInnerHTML={{ __html: cleanHtml(product.shortDescription) }}
              />
            )}

            <div className="border-y border-border/80 py-6 mb-8">
              <button
                onClick={() => setShowAdvisor(true)}
                className="inline-flex w-full min-h-12 items-center justify-center border border-secondary bg-background px-6 py-4 text-xs font-semibold tracking-widest uppercase text-secondary transition-all duration-300 hover:bg-secondary hover:text-background active:scale-[0.98] rounded-none"
              >
                Descubra seu Tamanho Ideal
              </button>
            </div>

            {/* Color/Estampa selector */}
            {colorSlugs.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                  {colorAttrDef?.name ?? 'Cor'}{selectedColor ? `: ${colorNames[selectedColor] ?? selectedColor}` : ''}
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
              <div className="mb-8 overflow-hidden border border-border animate-fade-in">
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
                {isOutOfStock ? 'Esgotado nessa variação' : 'Adicionar à Sacola'}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`h-14 w-14 rounded-full border border-border bg-background transition-colors hover:bg-muted active:scale-95 flex items-center justify-center ${
                  inWishlist ? 'text-red-500' : 'text-foreground'
                }`}
                aria-label={inWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
              </button>
            </div>
            {!canAdd && !isOutOfStock && (colorSlugs.length > 0 || sizeSlugs.length > 0) && (
              <p className="text-xs text-muted-foreground mt-2">
                Escolha {colorSlugs.length > 0 && sizeSlugs.length > 0 ? 'cor e tamanho' : colorSlugs.length > 0 ? 'a cor' : 'o tamanho'} para adicionar à sacola
              </p>
            )}
            {/* WhatsApp — ask about this product */}
            <a
              href={`https://wa.me/553133672467?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <MessageCircle size={14} />
              Dúvidas sobre este produto? Fale conosco pelo WhatsApp
            </a>
            {isOutOfStock && (
              <div className="mt-3">
                <BackInStockButton productId={product.slug} productName={product.name.replace(/ - Jaleca$/i, '')} />
              </div>
            )}
          </div>
        </div>

        {/* Content tabs */}
        <div className="mt-16 md:mt-24">
          {/* Tab headers */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-0">
            {([
              { id: 'dados-tecnicos', label: 'Dados Técnicos' },
              { id: 'informacoes', label: 'Informações Adicionais' },
              { id: 'avaliacoes', label: `Avaliações${reviews.length > 0 ? ` (${reviews.length})` : ''}` },
            ] as { id: ActiveTab; label: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-200 border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground bg-transparent'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8">
            {/* Dados Técnicos */}
            {activeTab === 'dados-tecnicos' && (
              <div className="max-w-3xl">
                {product.description ? (
                  <div className="technical-content">
                    <div
                      dangerouslySetInnerHTML={{ __html: formatTechnicalContent(product.description) }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Informações técnicas não disponíveis.</p>
                )}
              </div>
            )}

            {/* Informações Adicionais */}
            {activeTab === 'informacoes' && (
              <div className="max-w-lg">
                {productAttributes.length > 0 ? (
                  <table className="w-full text-sm border border-border">
                    <tbody>
                      {productAttributes.map(attr => (
                        <tr key={attr.name} className="border-b border-border last:border-0">
                          <td className="py-3 px-4 font-semibold capitalize w-1/3 bg-secondary/10">
                            {attr.name.replace(/^pa_/, '').replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {attr.terms?.nodes?.map(t => t.name).join(', ') || attr.options.join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted-foreground">Informações adicionais não disponíveis.</p>
                )}
              </div>
            )}

            {/* Avaliações */}
            {activeTab === 'avaliacoes' && (
              <div>
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-[1fr_360px] gap-12">
                    {/* Reviews list */}
                    <div>
                      {reviews.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
                      ) : (
                        <div className="space-y-6">
                          {reviews.map(review => (
                            <div key={review.id} className="border-b border-border pb-6">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center text-sm font-semibold">
                                  {review.reviewer.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{review.reviewer}</p>
                                  <div className="flex items-center gap-2">
                                    <StarRating rating={review.rating} size={12} />
                                    <span className="text-[11px] text-muted-foreground">
                                      {new Date(review.date_created).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {stripHtml(review.review)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review form */}
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-4">Deixe sua Avaliação</h3>
                      {reviewSuccess ? (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm">
                          Obrigada pela sua avaliação! Ela será publicada após revisão.
                        </div>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold tracking-widests uppercase text-muted-foreground mb-1.5">
                              Nota
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setReviewRating(i)}
                                  className="transition-transform hover:scale-110 active:scale-95"
                                >
                                  <Star
                                    size={24}
                                    className={i <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Nome *</label>
                            <input
                              type="text"
                              value={reviewName}
                              onChange={e => setReviewName(e.target.value)}
                              required
                              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Email *</label>
                            <input
                              type="email"
                              value={reviewEmail}
                              onChange={e => setReviewEmail(e.target.value)}
                              required
                              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-1.5">Avaliação *</label>
                            <textarea
                              value={reviewText}
                              onChange={e => setReviewText(e.target.value)}
                              required
                              rows={4}
                              className="w-full border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                              placeholder="Conte sua experiência..."
                            />
                          </div>
                          {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
                          <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="w-full bg-ink text-background py-3 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {reviewSubmitting && <Loader2 size={14} className="animate-spin" />}
                            Enviar Avaliação
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-8 md:mt-16">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
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
