import { notFound } from 'next/navigation'
import { graphqlClient, GET_PRODUCT_BY_SLUG } from '@/lib/graphql'
import ProductDetailClient from './ProductDetailClient'
import type { Metadata } from 'next'

async function getProduct(slug: string) {
  try {
    const data = await graphqlClient.request<{ product: Record<string, unknown> | null }>(
      GET_PRODUCT_BY_SLUG,
      { slug }
    )
    return data.product
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produto não encontrado — Jaleca' }
  return {
    title: `${product.name} — Jaleca`,
    description: `Compre ${product.name} na Jaleca. Uniformes profissionais premium.`,
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

  return <ProductDetailClient product={product as Parameters<typeof ProductDetailClient>[0]['product']} />
}
