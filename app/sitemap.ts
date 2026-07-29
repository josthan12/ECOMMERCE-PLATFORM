import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/structuredData'

export const revalidate = 3600

function sitemapUrl(pathOrUrl: string) {
  return absoluteUrl(pathOrUrl).replaceAll('&', '&amp;')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: {
        products: {
          some: { product: { archived: false } },
        },
      },
      select: {
        slug: true,
        bannerImageUrl: true,
        updatedAt: true,
      },
    }),
    prisma.product.findMany({
      where: { archived: false },
      select: {
        slug: true,
        imageUrl: true,
        updatedAt: true,
      },
    }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: sitemapUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: sitemapUrl('/categories'), changeFrequency: 'weekly', priority: 0.9 },
    { url: sitemapUrl('/products'), changeFrequency: 'daily', priority: 0.9 },
    { url: sitemapUrl('/about'), changeFrequency: 'monthly', priority: 0.5 },
    { url: sitemapUrl('/faq'), changeFrequency: 'monthly', priority: 0.5 },
    { url: sitemapUrl('/contact'), changeFrequency: 'monthly', priority: 0.4 },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: sitemapUrl(`/category/${category.slug}`),
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
    ...(category.bannerImageUrl
      ? { images: [sitemapUrl(category.bannerImageUrl)] }
      : {}),
  }))

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: sitemapUrl(`/product/${product.slug}`),
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
    ...(product.imageUrl ? { images: [sitemapUrl(product.imageUrl)] } : {}),
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
