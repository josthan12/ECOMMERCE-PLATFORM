import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Layers3, PackageCheck, PackageSearch } from 'lucide-react'
import BackButton from '../../components/BackButton'
import CatalogImage from '../../components/CatalogImage'
import ProductCard, { totalStock } from '../../components/ProductCard'
import ScrollReveal from '../../components/ScrollReveal'
import CatalogFilters from '../../components/CatalogFilters'
import { firstSearchParam, parseCatalogSort, sortCatalogProducts } from '@/lib/catalog'
import { absoluteUrl, serializeJsonLd } from '@/lib/structuredData'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sort?: string | string[]
    inStock?: string | string[]
    q?: string | string[]
  }>
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { product: { archived: false } },
        include: { product: { include: { variants: true } } },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })

  if (!category) return {}

  const title = category.seoTitle || category.name
  const description = category.seoDescription || category.description || undefined
  const categoryPath = `/category/${category.slug}`

  return {
    title: category.seoTitle ? { absolute: category.seoTitle } : category.name,
    description,
    alternates: { canonical: categoryPath },
    openGraph: {
      type: 'website',
      title,
      description,
      url: categoryPath,
      ...(category.bannerImageUrl ? { images: [category.bannerImageUrl] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(category.bannerImageUrl ? { images: [category.bannerImageUrl] } : {}),
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const query = await searchParams
  const sort = parseCatalogSort(query.sort)
  const inStock = firstSearchParam(query.inStock) === 'true'
  const search = firstSearchParam(query.q)?.trim() ?? ''
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const categoryUrl = absoluteUrl(`/category/${category.slug}`)
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
        item: categoryUrl,
      },
    ],
  }

  let products = category.products.map((cp) => cp.product)
  const hasProducts = products.length > 0
  const totalFormats = products.reduce((sum, product) => sum + product.variants.length, 0)
  const availableProducts = products.filter((product) => totalStock(product.variants) > 0).length

  if (search) {
    const normalizedSearch = search.toLocaleLowerCase()
    products = products.filter((product) =>
      [product.name, product.description]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch))
    )
  }

  if (inStock) {
    products = products.filter((p) => totalStock(p.variants) > 0)
  }

  products = sortCatalogProducts(products, sort)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-12">
        <BackButton />

        <section className="relative mt-4 overflow-hidden rounded-2xl border border-border-light bg-linear-to-br from-[#12345f] via-[#0a1c35] to-[#060c17] shadow-card md:mt-6">
          <div className="relative grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-w-3xl px-6 py-12 sm:px-9 md:py-16 lg:px-12">
              <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
                TCG catalogue
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-on-ink md:text-6xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 max-w-2xl text-base leading-7 text-on-ink-muted">
                  {category.description}
                </p>
              )}

              <dl className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-4">
                <div className="pr-4">
                  <dt className="text-xs text-on-ink-muted">Sets</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-on-ink">{category.products.length}</dd>
                </div>
                <div className="px-4">
                  <dt className="text-xs text-on-ink-muted">Formats</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-on-ink">{totalFormats}</dd>
                </div>
                <div className="pl-4">
                  <dt className="text-xs text-on-ink-muted">Available</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-on-ink">{availableProducts}</dd>
                </div>
              </dl>
            </div>
            {category.bannerImageUrl && (
              <div className="relative min-h-[300px] overflow-hidden border-t border-white/10 lg:min-h-0 lg:border-t-0 lg:border-l">
                <CatalogImage
                  src={category.bannerImageUrl}
                  alt=""
                  sizes="(max-width: 1023px) 100vw, 360px"
                  fit="cover"
                  eager
                />
              </div>
            )}
          </div>
        </section>

        {hasProducts && (
          <CatalogFilters
            action={`/category/${category.slug}`}
            sort={sort}
            inStock={inStock}
            search={search}
            searchLabel="Search this category"
          />
        )}

        {hasProducts && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                Available sets
              </p>
              <p className="mt-1 text-sm text-text-muted" aria-live="polite">
                {products.length} {products.length === 1 ? 'result' : 'results'}
                {search ? ` for “${search}”` : ''}
              </p>
            </div>
            <div className="hidden items-center gap-5 text-xs text-text-muted sm:flex">
              <span className="inline-flex items-center gap-1.5">
                <Layers3 className="h-4 w-4 text-accent" aria-hidden="true" />
                Each card is one set
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PackageCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                Formats are selected inside
              </span>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-xl border border-border-light bg-surface py-16 text-center">
            <PackageSearch className="h-8 w-8 text-text-light" aria-hidden="true" />
            <p className="mt-3 font-display text-lg text-primary">
              {hasProducts ? "This binder page doesn't have a match." : 'Looks like this binder page is empty.'}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {hasProducts ? 'Try adjusting your filters.' : 'Check back soon for new arrivals.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <ScrollReveal key={product.id} delayMs={index * 60}>
                <ProductCard product={product} headingLevel="h2" />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
