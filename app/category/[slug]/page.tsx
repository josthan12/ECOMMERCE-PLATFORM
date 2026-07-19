import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PackageSearch } from 'lucide-react'
import BackButton from '../../components/BackButton'
import ProductCard, { totalStock } from '../../components/ProductCard'
import ScrollReveal from '../../components/ScrollReveal'
import Button from '../../components/ui/Button'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; inStock?: string }>
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

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || undefined,
  }
}

function minPrice(variants: { price: number }[]) {
  if (variants.length === 0) return 0
  return Math.min(...variants.map((v) => v.price))
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { sort = 'newest', inStock } = await searchParams
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  let products = category.products.map((cp) => cp.product)
  const hasProducts = products.length > 0

  if (inStock === 'true') {
    products = products.filter((p) => totalStock(p.variants) > 0)
  }

  switch (sort) {
    case 'price-asc':
      products = [...products].sort((a, b) => minPrice(a.variants) - minPrice(b.variants))
      break
    case 'price-desc':
      products = [...products].sort((a, b) => minPrice(b.variants) - minPrice(a.variants))
      break
    case 'name':
      products = [...products].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
    default:
      products = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
  }

  return (
    <div>
      {category.bannerImageUrl && (
        <div className="h-56 w-full bg-surface-muted md:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={category.bannerImageUrl} alt={category.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
        <BackButton />

        <h1 className="mt-4 font-display text-3xl font-semibold text-primary md:mt-6 md:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-text-muted">{category.description}</p>
        )}

        {hasProducts && (
          <form method="GET" className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-text-muted">
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="min-h-[44px] rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input
                type="checkbox"
                name="inStock"
                value="true"
                defaultChecked={inStock === 'true'}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent"
              />
              In stock only
            </label>

            <Button type="submit" size="sm">
              Apply
            </Button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
            <PackageSearch className="h-8 w-8 text-text-light" aria-hidden="true" />
            <p className="mt-3 font-display text-lg text-primary">
              {hasProducts ? "This binder page doesn't have a match." : 'Looks like this binder page is empty.'}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {hasProducts ? 'Try adjusting your filters.' : 'Check back soon for new arrivals.'}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
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