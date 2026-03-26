'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { graphqlClient, SEARCH_PRODUCTS } from '@/lib/graphql'

type SearchProduct = {
  id: string
  databaseId: number
  name: string
  slug: string
  price?: string
  regularPrice?: string
  image?: { sourceUrl: string; altText: string }
}

type SearchResult = {
  products: {
    nodes: SearchProduct[]
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await graphqlClient.request<SearchResult>(SEARCH_PRODUCTS, { search: term, first: 8 })
      setResults(data.products.nodes)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[124px] px-4 animate-fade-in"
    >
      <div className="bg-background w-full max-w-lg shadow-2xl border border-border">
        {/* Search input */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search size={18} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Buscar produtos..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
          {loading && <Loader2 size={16} className="animate-spin text-muted-foreground flex-shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95 flex-shrink-0"
            aria-label="Fechar busca"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 && !loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado para &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div>
                {results.map(product => (
                  <Link
                    key={product.id}
                    href={`/produto/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors border-b border-border last:border-0"
                  >
                    <div className="w-14 h-16 flex-shrink-0 bg-secondary/20 overflow-hidden">
                      {product.image?.sourceUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image.sourceUrl}
                          alt={product.image.altText || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name.replace(/ - Jaleca$/i, '')}
                      </p>
                      {product.price && (
                        <p className="text-sm text-muted-foreground mt-0.5">{product.price}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {query.length < 2 && query.length > 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Continue digitando para buscar...
          </div>
        )}

        {query.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Digite para buscar jalecos, scrubs e mais
          </div>
        )}
      </div>
    </div>
  )
}
