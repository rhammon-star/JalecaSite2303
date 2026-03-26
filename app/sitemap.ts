import type { MetadataRoute } from 'next'
import { graphqlClient, GET_PRODUCTS } from '@/lib/graphql'
import { getPosts } from '@/lib/wordpress'
import type { WPPost } from '@/lib/wordpress'

type ProductNode = {
  slug: string
  modified?: string
}

type ProductsResponse = {
  products: {
    nodes: ProductNode[]
  }
}

const SITE_URL = 'https://jaleca.com.br'

async function getAllProductSlugs(): Promise<ProductNode[]> {
  try {
    const data = await graphqlClient.request<ProductsResponse>(GET_PRODUCTS, { first: 100 })
    return data.products.nodes
  } catch {
    return []
  }
}

async function getAllPosts(): Promise<WPPost[]> {
  try {
    const posts = await getPosts({ per_page: 100 })
    return posts
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.allSettled([
    getAllProductSlugs(),
    getAllPosts(),
  ])

  const productNodes = products.status === 'fulfilled' ? products.value : []
  const postNodes = posts.status === 'fulfilled' ? posts.value : []

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/produtos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const productPages: MetadataRoute.Sitemap = productNodes.map(product => ({
    url: `${SITE_URL}/produto/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const postPages: MetadataRoute.Sitemap = postNodes.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...postPages]
}
