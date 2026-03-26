import { NextRequest } from 'next/server'

const WC_API = process.env.WOOCOMMERCE_API_URL || 'https://jaleca.com.br/wp-json/wc/v3'
const WP_API = (process.env.NEXT_PUBLIC_WC_URL || 'https://jaleca.com.br') + '/wp-json/wp/v2'
const auth = Buffer.from(
  `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
).toString('base64')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  if (!productId) return Response.json({})

  try {
    // Fetch all variations via WooCommerce REST API (includes meta_data)
    const res = await fetch(`${WC_API}/products/${productId}/variations?per_page=100`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return Response.json({})
    const variations = await res.json()

    // Collect all attachment IDs from gallery meta
    const varIdToImageIds: Record<number, number[]> = {}
    const allIds: number[] = []

    for (const v of variations) {
      const galleryMeta = v.meta_data?.find(
        (m: { key: string; value: unknown }) =>
          m.key === '_woo_variation_gallery_images' ||
          m.key === 'woo_variation_gallery' ||
          m.key === 'variation_gallery_images'
      )
      if (!galleryMeta?.value) continue

      let ids: number[]
      if (Array.isArray(galleryMeta.value)) {
        ids = galleryMeta.value.map(Number).filter(Boolean)
      } else {
        ids = String(galleryMeta.value).split(',').map(Number).filter(Boolean)
      }

      if (ids.length > 0) {
        varIdToImageIds[v.id] = ids
        allIds.push(...ids)
      }
    }

    if (allIds.length === 0) return Response.json({})

    // Fetch image URLs from WordPress media API
    const uniqueIds = [...new Set(allIds)]
    const mediaRes = await fetch(
      `${WP_API}/media?include=${uniqueIds.join(',')}&per_page=100`,
      { next: { revalidate: 3600 } }
    )
    if (!mediaRes.ok) return Response.json({})
    const mediaItems = await mediaRes.json()

    const idToUrl: Record<number, { sourceUrl: string; altText: string }> = {}
    for (const m of mediaItems) {
      idToUrl[m.id] = { sourceUrl: m.source_url, altText: m.alt_text || '' }
    }

    // Build final map: variationDatabaseId → gallery images[]
    const result: Record<number, Array<{ sourceUrl: string; altText: string }>> = {}
    for (const [varId, imageIds] of Object.entries(varIdToImageIds)) {
      const images = imageIds.map(id => idToUrl[id]).filter(Boolean)
      if (images.length > 0) {
        result[Number(varId)] = images
      }
    }

    return Response.json(result)
  } catch {
    return Response.json({})
  }
}
