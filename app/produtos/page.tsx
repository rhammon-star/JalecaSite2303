import { graphqlClient, GET_PRODUCTS } from '@/lib/graphql'
import ProductsClient from './ProductsClient'
import type { WooProduct } from '@/components/ProductCard'

async function getAllProducts(): Promise<WooProduct[]> {
  try {
    const data = await graphqlClient.request<{
      products: { nodes: WooProduct[] }
    }>(GET_PRODUCTS, { first: 100 })
    return data.products.nodes
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Produtos — Jaleca',
  description: 'Explore nossa coleção completa de jalecos premium para profissionais.',
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const products = await getAllProducts()

  return <ProductsClient products={products} initialCat={cat || 'Todos'} />
}
