import { prisma } from '@/lib/prisma'
import ProductCard from '../ProductCard'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  if (products.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">New Arrivals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            headingLevel="h3"
            showOutOfStockBadge={false}
          />
        ))}
      </div>
    </div>
  )
}