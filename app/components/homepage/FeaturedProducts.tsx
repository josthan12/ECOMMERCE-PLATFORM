import { prisma } from '@/lib/prisma'
import Link from 'next/link'

function formatPrice(variants: { price: number }[]) {
  if (variants.length === 0) return '—'
  const prices = variants.map((v) => v.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`
}

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
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="bg-white rounded-lg shadow overflow-hidden block hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-100">
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-800">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{formatPrice(product.variants)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}