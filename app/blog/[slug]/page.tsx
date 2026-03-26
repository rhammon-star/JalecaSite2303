import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react'
import { getPostBySlug, getPosts } from '@/lib/wordpress'
import type { WPPost } from '@/lib/wordpress'
import type { Metadata } from 'next'

function getFeaturedImageUrl(post: WPPost): string | null {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
}

function getAuthorName(post: WPPost): string {
  return post._embedded?.author?.[0]?.name ?? 'Jaleca'
}

function getCategories(post: WPPost): Array<{ name: string; slug?: string }> {
  const terms = post._embedded?.['wp:term']
  if (!terms) return []
  return terms.flat().filter(t => t.id).map(t => ({ name: t.name, slug: t.slug }))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post não encontrado — Jaleca' }

  const title = stripHtml(post.title.rendered)
  const description = stripHtml(post.excerpt.rendered).slice(0, 160)
  const imageUrl = getFeaturedImageUrl(post)

  return {
    title: `${title} — Jaleca Blog`,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [getAuthorName(post)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const title = stripHtml(post.title.rendered)
  const author = getAuthorName(post)
  const categories = getCategories(post)
  const imageUrl = getFeaturedImageUrl(post)
  const excerpt = stripHtml(post.excerpt.rendered)

  // Fetch related posts
  let relatedPosts: WPPost[] = []
  try {
    const allPosts = await getPosts({ per_page: 4 })
    relatedPosts = allPosts.filter(p => p.id !== post.id).slice(0, 3)
  } catch {
    relatedPosts = []
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    image: imageUrl ?? undefined,
    datePublished: post.date,
    dateModified: post.modified,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jaleca',
      url: 'https://jaleca.com.br',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jaleca.com.br/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://jaleca.com.br/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <main className="py-8 md:py-12">
        <div className="container max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft size={16} /> Blog
          </Link>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Tag size={11} className="text-accent" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-accent">
                {categories[0].name}
              </span>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-[-0.02em] mb-6 text-balance">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={13} />
              {author}
            </span>
          </div>

          {/* Featured image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] overflow-hidden mb-10 bg-secondary/20">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-sm md:prose-base max-w-none
              prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-[-0.02em]
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:underline prose-a:underline-offset-4
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:text-muted-foreground prose-li:my-1
              prose-img:rounded-none"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Footer */}
          {categories.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Categorias:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span
                    key={cat.name}
                    className="text-xs px-3 py-1 border border-border text-muted-foreground"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="container max-w-4xl mt-16 md:mt-24">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8">
              Leia também
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => {
                const relatedTitle = stripHtml(related.title.rendered)
                const relatedImage = getFeaturedImageUrl(related)
                const relatedExcerpt = stripHtml(related.excerpt.rendered).slice(0, 120)

                return (
                  <Link key={related.id} href={`/blog/${related.slug}`} className="group">
                    {relatedImage && (
                      <div className="aspect-[16/9] overflow-hidden mb-3 bg-secondary/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relatedImage}
                          alt={relatedTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="font-display text-base font-semibold mb-1 group-hover:text-primary transition-colors leading-snug">
                      {relatedTitle}
                    </h3>
                    {relatedExcerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{relatedExcerpt}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
