import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
  })

  if (categories.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="bg-white rounded-lg shadow overflow-hidden block hover:shadow-md transition-shadow"
          >
            <div className="h-32 bg-gray-100">
              {category.bannerImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={category.bannerImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-800">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}