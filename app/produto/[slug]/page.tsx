import { notFound } from 'next/navigation'
import { graphqlClient, GET_PRODUCT_BY_SLUG } from '@/lib/graphql'
import ProductDetailClient from './ProductDetailClient'
import type { Metadata } from 'next'

type ProductData = Record<string, unknown> & {
  name?: string
  description?: string
  shortDescription?: string
  sku?: string
  price?: string
  regularPrice?: string
  image?: { sourceUrl: string; altText: string }
  stockStatus?: string
}

async function getProduct(slug: string): Promise<ProductData | null> {
  try {
    const data = await graphqlClient.request<{ product: ProductData | null }>(
      GET_PRODUCT_BY_SLUG,
      { slug }
    )
    return data.product
  } catch {
    return null
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produto não encontrado — Jaleca' }

  const name = String(product.name || '').replace(/ - Jaleca$/i, '')
  const shortDesc = product.shortDescription
    ? stripHtml(String(product.shortDescription)).slice(0, 160)
    : null
  const longDesc = product.description
    ? stripHtml(String(product.description)).slice(0, 160)
    : null
  const description = shortDesc || longDesc || `Compre ${name} na Jaleca. Uniformes profissionais premium.`
  const imageUrl = product.image?.sourceUrl

  return {
    title: `${name} | Jaleca`,
    description,
    openGraph: {
      title: name,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const name = String(product.name || '').replace(/ - Jaleca$/i, '')
  const shortDesc = product.shortDescription
    ? stripHtml(String(product.shortDescription)).slice(0, 200)
    : null
  const longDesc = product.description
    ? stripHtml(String(product.description)).slice(0, 200)
    : null
  const description = shortDesc || longDesc || `Uniforme profissional premium da Jaleca.`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.image?.sourceUrl,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Jaleca',
    },
    offers: {
      '@type': 'Offer',
      price: String(product.price || product.regularPrice || '').replace(/[^0-9,]/g, '').replace(',', '.') || undefined,
      priceCurrency: 'BRL',
      availability:
        product.stockStatus === 'OUT_OF_STOCK'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      url: `https://jaleca.com.br/produto/${slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Jaleca',
      },
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
      <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} />
    </>
  )
}
