import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BackButton from '../../components/BackButton'
import ProductCard, { totalStock } from '../../components/ProductCard'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; inStock?: string }>
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: {
          product: {
            archived: false,
          },
        },
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
        <BackButton />

        <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600 max-w-2xl">{category.description}</p>
        )}

        {hasProducts && (
          <form method="GET" className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-gray-600 mr-2">Sort by</label>
              <select
                name="sort"
                defaultValue={sort}
                className="border rounded px-3 py-1.5 text-sm"
              >
                <option value="newest">Newest (Default)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="inStock"
                value="true"
                defaultChecked={inStock === 'true'}
              />
              In stock only
            </label>

            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-900"
            >
              Apply
            </button>
          </form>
        )}

        {products.length === 0 ? (
          <div className="mt-10 bg-white rounded-lg p-8 text-center text-gray-500">
            {hasProducts
              ? 'No products match your filters.'
              : 'No products in this category yet.'}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} headingLevel="h2" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}