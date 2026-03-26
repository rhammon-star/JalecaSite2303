'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { graphqlClient } from '@/lib/graphql'

const GET_PRODUCTS_BY_IDS = `
  query GetProductsByIds($ids: [ID!]) {
    products(where: { include: $ids }, first: 50) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          image {
            sourceUrl
            altText
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`

type WishProduct = {
  id: string
  databaseId: number
  name: string
  slug: string
  price?: string
  regularPrice?: string
  image?: { sourceUrl: string; altText: string }
}

export default function WishlistClient() {
  const { items, removeFromWishlist } = useWishlist()
  const { addItem } = useCart()
  const [products, setProducts] = useState<WishProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setProducts([])
      return
    }
    setLoading(true)
    graphqlClient
      .request<{ products: { nodes: WishProduct[] } }>(GET_PRODUCTS_BY_IDS, {
        ids: items,
      })
      .then(data => setProducts(data.products.nodes))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [items])

  if (items.length === 0) {
    return (
      <main className="py-16">
        <div className="container max-w-md text-center">
          <Heart size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="font-display text-3xl font-semibold mb-3">Favoritos</h1>
          <p className="text-muted-foreground mb-6">Você ainda não salvou nenhum produto.</p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 bg-ink text-background px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-ink/90 transition-all"
          >
            Explorar Produtos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Favoritos</h1>
        <p className="text-muted-foreground text-sm mb-8">{items.length} produto{items.length !== 1 ? 's' : ''} salvos</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map(id => (
              <div key={id} className="aspect-[3/4] bg-secondary/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <div key={product.id} className="group relative">
                <Link href={`/produto/${product.slug}`} className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-secondary/20 mb-3">
                    {product.image?.sourceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image.sourceUrl}
                        alt={product.image.altText || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium truncate">{product.name.replace(/ - Jaleca$/i, '')}</h3>
                  {product.price && (
                    <p className="text-sm text-muted-foreground mt-0.5">{product.price}</p>
                  )}
                </Link>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      addItem({
                        id: product.id,
                        databaseId: product.databaseId,
                        slug: product.slug,
                        name: product.name.replace(/ - Jaleca$/i, ''),
                        image: product.image?.sourceUrl,
                        price: product.price || product.regularPrice || '',
                      })
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-ink text-background py-2 text-[11px] font-semibold tracking-widest uppercase hover:bg-ink/90 transition-colors"
                  >
                    <ShoppingBag size={12} />
                    Adicionar
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-9 h-9 flex items-center justify-center border border-border hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Remover dos favoritos"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
