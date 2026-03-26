const UNSPLASH_API_URL = 'https://api.unsplash.com'

type UnsplashPhoto = {
  id: string
  urls: {
    regular: string
    full: string
    small: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
  alt_description: string | null
}

type UnsplashSearchResponse = {
  results: UnsplashPhoto[]
  total: number
  total_pages: number
}

// Fallback images for medical/health content (no API key needed)
const FALLBACK_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80', authorName: 'Unsplash', authorLink: 'https://unsplash.com' },
  { url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80', authorName: 'Unsplash', authorLink: 'https://unsplash.com' },
  { url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&q=80', authorName: 'Unsplash', authorLink: 'https://unsplash.com' },
  { url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80', authorName: 'Unsplash', authorLink: 'https://unsplash.com' },
  { url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80', authorName: 'Unsplash', authorLink: 'https://unsplash.com' },
]

export async function searchImage(
  query: string
): Promise<{ url: string; authorName: string; authorLink: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  // If key available, use real Unsplash API
  if (accessKey && accessKey !== 'PLACEHOLDER') {
    try {
      const params = new URLSearchParams({
        query,
        per_page: '10',
        orientation: 'landscape',
        content_filter: 'high',
      })
      const res = await fetch(`${UNSPLASH_API_URL}/search/photos?${params.toString()}`, {
        headers: { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' },
      })
      if (res.ok) {
        const data: UnsplashSearchResponse = await res.json()
        if (data.results?.length) {
          const photo = data.results[0]
          return { url: photo.urls.regular, authorName: photo.user.name, authorLink: photo.user.links.html }
        }
      }
    } catch { /* fall through to fallback */ }
  }

  // Fallback: return a random medical image from curated list
  const idx = Math.floor(Math.random() * FALLBACK_IMAGES.length)
  return FALLBACK_IMAGES[idx]
}

export async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
