import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getLooks } from '@/lib/lookbook-data'

export const metadata: Metadata = {
  title: 'Lookbook — Jaleca',
  description: 'Inspiração editorial: veja como usar nossos jalecos e uniformes com estilo.',
}

export const revalidate = 0

export default function LookbookPage() {
  const looks = getLooks()

  return (
    <main className="py-8 md:py-16">
      <div className="container">
        {/* Hero */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Editorial
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.1] mb-4">
            Lookbook 2026
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
            Cada peça conta uma história. Descubra como o uniforme certo transforma a sua presença profissional.
          </p>
        </div>

        {looks.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum look publicado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {looks.map((look, idx) => (
              <div
                key={look.id}
                className={`group ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-secondary/20 mb-4 ${
                    idx % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                  }`}
                >
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                </div>

                {/* Info */}
                <div>
                  <h2 className="font-display text-xl font-semibold mb-1">{look.title}</h2>
                  <p className="text-sm text-muted-foreground mb-3">{look.description}</p>

                  {look.products?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                        Shop the look
                      </p>
                      <div className="space-y-1">
                        {look.products.map(product => (
                          <Link
                            key={product.slug}
                            href={`/produto/${product.slug}`}
                            className="flex items-center justify-between text-sm hover:text-primary transition-colors group/link"
                          >
                            <span className="underline underline-offset-2 group-hover/link:no-underline">
                              {product.name}
                            </span>
                            <span className="text-muted-foreground text-xs tabular-nums">
                              {product.price}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-foreground/90 transition-colors"
          >
            Ver toda a coleção
          </Link>
        </div>
      </div>
    </main>
  )
}
