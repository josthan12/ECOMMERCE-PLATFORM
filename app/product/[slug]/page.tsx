import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductGallery from './ProductGallery'
import BackButton from '../../components/BackButton'
import ProductCard from '../../components/ProductCard'
import ScrollReveal from '../../components/ScrollReveal'
import { absoluteUrl, serializeJsonLd } from '@/lib/structuredData'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      productType: {
        include: { fields: true },
      },
      variants: true,
      categoryProducts: {
        include: { category: true },
        orderBy: { category: { name: 'asc' } },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })

  if (!product || product.archived) return {}

  const description = product.description || undefined
  const productPath = `/product/${product.slug}`

  return {
    title: product.name,
    description,
    alternates: { canonical: productPath },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: productPath,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product || product.archived) {
    notFound()
  }

  const attributes = (product.attributes ?? {}) as Record<string, unknown>
  const variantOptions = (product.variantOptions ?? {}) as Record<string, string[]>
  const category = product.categoryProducts[0]?.category
  const relatedProducts = category
    ? await prisma.product.findMany({
        where: {
          id: { not: product.id },
          archived: false,
          categoryProducts: { some: { categoryId: category.id } },
        },
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      })
    : []
  const productUrl = absoluteUrl(`/product/${product.slug}`)
  const images = [
    product.imageUrl,
    ...product.variants.map((variant) => variant.imageUrl),
  ]
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl))
    .map(absoluteUrl)
    .filter((imageUrl, index, allImages) => allImages.indexOf(imageUrl) === index)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: productUrl,
    ...(product.description ? { description: product.description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.variants.length > 0
      ? {
          offers: product.variants.map((variant) => ({
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'SGD',
            price: variant.price.toFixed(2),
            availability:
              variant.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            ...(variant.sku ? { sku: variant.sku } : {}),
          })),
        }
      : {}),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Categories',
              item: absoluteUrl('/categories'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: absoluteUrl(`/category/${category.slug}`),
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 2,
              name: 'All products',
              item: absoluteUrl('/products'),
            },
          ]),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <BackButton />

      <div className="mt-4 md:mt-6">
        <ProductGallery
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          description={product.description}
          attributes={attributes}
          variantOptions={variantOptions}
          variants={product.variants}
          fallbackImageUrl={product.imageUrl}
          category={category ? { name: category.name, slug: category.slug } : undefined}
        />
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border-light pt-10 md:mt-20 md:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                More from {category?.name}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-primary md:text-3xl">
                Related sets
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct, index) => (
              <ScrollReveal key={relatedProduct.id} delayMs={Math.min(index * 60, 180)}>
                <ProductCard product={relatedProduct} headingLevel="h3" />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
