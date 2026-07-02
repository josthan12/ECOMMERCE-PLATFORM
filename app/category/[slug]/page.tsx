import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: true,
            },
          },
        },
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

function formatPrice(variants: { price: number }[]) {
  if (variants.length === 0) return '—'
  const prices = variants.map((v) => v.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`
}

function totalStock(variants: { stock: number }[]) {
  return variants.reduce((sum, v) => sum + v.stock, 0)
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const products = category.products.map((cp) => cp.product)

  return (
    <div>
      {category.bannerImageUrl && (
        <div className="w-full h-64 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.bannerImageUrl}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600 max-w-2xl">{category.description}</p>
        )}

        {products.length === 0 ? (
          <div className="mt-10 bg-white rounded-lg p-8 text-center text-gray-500">
            No products in this category yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => {
              const outOfStock = totalStock(product.variants) === 0

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow overflow-hidden relative"
                >
                  {outOfStock && (
                    <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                  <div className="h-40 bg-gray-100" />
                  <div className="p-4">
                    <h2 className="font-medium text-gray-800">{product.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatPrice(product.variants)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}