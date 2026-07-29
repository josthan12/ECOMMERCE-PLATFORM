import type { Metadata } from 'next'
import { PackageSearch } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import {
  firstSearchParam,
  parseCatalogSort,
  parsePositivePage,
  sortCatalogProducts,
} from '@/lib/catalog'
import { absoluteUrl, serializeJsonLd } from '@/lib/structuredData'
import BackButton from '../components/BackButton'
import CatalogFilters from '../components/CatalogFilters'
import CatalogPagination from '../components/CatalogPagination'
import ProductCard from '../components/ProductCard'
import ScrollReveal from '../components/ScrollReveal'

const PRODUCTS_PER_PAGE = 24

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse all authentic trading card products available from PokeSunshineTCG.',
  alternates: { canonical: '/products' },
}

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string | string[]
    sort?: string | string[]
    inStock?: string | string[]
    page?: string | string[]
    q?: string | string[]
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams
  const sort = parseCatalogSort(query.sort)
  const selectedCategory = firstSearchParam(query.category) ?? ''
  const inStock = firstSearchParam(query.inStock) === 'true'
  const search = firstSearchParam(query.q)?.trim() ?? ''
  const requestedPage = parsePositivePage(query.page)

  const [categories, matchingProducts] = await Promise.all([
    prisma.category.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: {
        archived: false,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
        ...(selectedCategory
          ? {
              categoryProducts: {
                some: { category: { slug: selectedCategory } },
              },
            }
          : {}),
        ...(inStock ? { variants: { some: { stock: { gt: 0 } } } } : {}),
      },
      include: { variants: true },
    }),
  ])

  const products = sortCatalogProducts(matchingProducts, sort)
  const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE))
  const currentPage = Math.min(requestedPage, totalPages)
  const pageProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )
  const selectedCategoryName = categories.find(
    (category) => category.slug === selectedCategory
  )?.name

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
        name: 'All products',
        item: absoluteUrl('/products'),
      },
    ],
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <BackButton />

      <ScrollReveal>
        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
          PokeSunshineTCG
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-primary md:text-6xl">
          All products
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
          Explore the complete catalogue and narrow it by category, availability or price.
        </p>
      </ScrollReveal>

      <CatalogFilters
        action="/products"
        sort={sort}
        inStock={inStock}
        categories={categories}
        selectedCategory={selectedCategory}
        search={search}
        searchLabel="Search all products"
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted" aria-live="polite">
          {products.length} {products.length === 1 ? 'product' : 'products'}
          {selectedCategoryName ? ` in ${selectedCategoryName}` : ''}
          {search ? ` matching “${search}”` : ''}
        </p>
      </div>

      {pageProducts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-border-light bg-surface py-16 text-center">
          <PackageSearch className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">
            No products match these filters.
          </p>
          <p className="mt-1 text-sm text-text-muted">Try another category or reset the filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {pageProducts.map((product, index) => (
            <ScrollReveal key={product.id} delayMs={Math.min(index * 35, 210)}>
              <ProductCard product={product} headingLevel="h2" />
            </ScrollReveal>
          ))}
        </div>
      )}

      <CatalogPagination
        basePath="/products"
        currentPage={currentPage}
        totalPages={totalPages}
        filters={{
          category: selectedCategory || undefined,
          sort: sort === 'newest' ? undefined : sort,
          inStock: inStock ? 'true' : undefined,
          q: search || undefined,
        }}
      />
    </div>
  )
}
