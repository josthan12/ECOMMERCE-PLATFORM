import { prisma } from '@/lib/prisma'
import { PackageSearch } from 'lucide-react'
import BackButton from '../components/BackButton'
import ProductCard from '../components/ProductCard'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const products = query
    ? await prisma.product.findMany({
        where: {
          archived: false,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-16">
      <BackButton />

      <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-accent uppercase">
        Catalogue search
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>

      {!query ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-border-light bg-surface p-10 text-center shadow-input">
          <PackageSearch className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-semibold text-primary">
            Find a product
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Use the search field in the header to find cards, sets, or TCG products.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-border-light bg-surface p-10 text-center shadow-input">
          <PackageSearch className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-semibold text-primary">
            No matching products
          </p>
          <p className="mt-1 text-sm text-text-muted">
            No products matched &quot;{query}&quot;. Try a broader search term.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-text-muted" role="status">
            {products.length} result{products.length === 1 ? '' : 's'}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} headingLevel="h2" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
