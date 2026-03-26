import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/blog/admin/', '/api/', '/checkout'],
    },
    sitemap: 'https://jaleca.com.br/sitemap.xml',
  }
}
