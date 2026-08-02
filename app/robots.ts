import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/structuredData'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/account/',
        '/admin/',
        '/api/',
        '/cart',
        '/checkout/',
        '/search',
        '/sign-in/',
        '/sign-up/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
