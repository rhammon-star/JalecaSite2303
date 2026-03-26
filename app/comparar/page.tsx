'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCompare } from '@/contexts/CompareContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingBag } from 'lucide-react'

function parsePrice(price?: string): number {
  if (!price) return 0
  return parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
}

export default function CompararPage() {
  const { products, clearCompare } = useCompare()
  const { addItem } = useCart()

  if (products.length === 0) {
    return (
      <main className="py-16">
        <div className="container max-w-md text-center">
          <h1 className="font-display text-3xl font-semibold mb-4">Comparar Produtos</h1>
          <p className="text-muted-foreground mb-6">
            Nenhum produto selecionado para comparar. Navegue pela loja e adicione produtos ao comparador.
          </p>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors"
          >
            Ver Produtos
          </Link>
        </div>
      </main>
    )
  }

  const rows: { label: string; getValue: (p: (typeof products)[0]) => string }[] = [
    { label: 'Preço', getValue: p => p.price || p.regularPrice || '—' },
    {
      label: 'Em promoção',
      getValue: p =>
        p.salePrice && p.salePrice !== p.regularPrice ? `Sim (${p.salePrice})` : 'Não',
    },
    {
      label: 'Tamanhos',
      getValue: p =>
        p.variations?.nodes
          .flatMap(v =>
            v.attributes.nodes.filter(a => a.name.includes('tamanho') || a.name.includes('size')).map(a => a.value)
          )
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(', ') || '—',
    },
    {
      label: 'Cores',
      getValue: p =>
        p.variations?.nodes
          .flatMap(v =>
            v.attributes.nodes.filter(a => a.name.includes('cor') || a.name.includes('color')).map(a => a.value)
          )
          .filter((v, i, arr) => arr.indexOf(v) === i)
          .join(', ') || '—',
    },
  ]

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Comparar Produtos</h1>
          <button
            onClick={clearCompare}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Limpar comparação
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-32 md:w-48 text-left p-3 border border-border text-xs font-semibold tracking-widest uppercase text-muted-foreground bg-secondary/10">
                  Produto
                </th>
                {products.map(p => (
                  <th key={p.id} className="p-3 border border-border text-center align-top">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-24 h-32 mx-auto">
                        {p.image?.sourceUrl ? (
                          <Image
                            src={p.image.sourceUrl}
                            alt={p.image.altText || p.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary/20" />
                        )}
                      </div>
                      <Link
                        href={`/produto/${p.slug}`}
                        className="font-body text-sm font-medium hover:text-primary transition-colors text-center"
                      >
                        {p.name.replace(/ - Jaleca$/i, '')}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label}>
                  <td className="p-3 border border-border text-xs font-semibold tracking-widest uppercase text-muted-foreground bg-secondary/10">
                    {row.label}
                  </td>
                  {products.map(p => (
                    <td key={p.id} className="p-3 border border-border text-center text-sm text-muted-foreground">
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Add to cart row */}
              <tr>
                <td className="p-3 border border-border text-xs font-semibold tracking-widests uppercase text-muted-foreground bg-secondary/10">
                  Ação
                </td>
                {products.map(p => (
                  <td key={p.id} className="p-3 border border-border text-center">
                    <button
                      onClick={() =>
                        addItem({
                          id: p.id,
                          databaseId: p.databaseId,
                          slug: p.slug,
                          name: p.name.replace(/ - Jaleca$/i, ''),
                          image: p.image?.sourceUrl,
                          price: p.price || p.regularPrice || '0',
                        })
                      }
                      className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-2 text-[11px] font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                    >
                      <ShoppingBag size={12} />
                      Adicionar
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
