import { prisma } from '@/lib/prisma'
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <BackButton />

      <h1 className="text-3xl font-bold text-gray-800">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>

      {!query ? (
        <div className="mt-10 bg-white rounded-lg p-8 text-center text-gray-500">
          Enter a search term to find products.
        </div>
      ) : products.length === 0 ? (
        <div className="mt-10 bg-white rounded-lg p-8 text-center text-gray-500">
          No products matched &quot;{query}&quot;.
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-500">
            {products.length} result{products.length === 1 ? '' : 's'}
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} headingLevel="h2" />
            ))}
          </div>
        </>
      )}
    </div>
  )
}