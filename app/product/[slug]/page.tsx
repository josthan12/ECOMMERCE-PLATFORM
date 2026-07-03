import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductGallery from './ProductGallery'
import BackButton from '../../components/BackButton'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      productType: {
        include: { fields: true },
      },
      variants: true,
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })

  if (!product) return {}

  return {
    title: product.name,
    description: product.description || undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const attributes = (product.attributes ?? {}) as Record<string, unknown>
  const variantOptions = (product.variantOptions ?? {}) as Record<string, string[]>
  const attributeEntries = Object.entries(attributes)

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <BackButton />

      <div className="grid md:grid-cols-2 gap-10">
        <ProductGallery
          variantOptions={variantOptions}
          variants={product.variants}
          fallbackImageUrl={product.imageUrl}
        />

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          {product.description && (
            <p className="mt-2 text-gray-600">{product.description}</p>
          )}
        </div>
      </div>

      {attributeEntries.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h2>
          <table className="w-full text-sm border-t">
            <tbody>
              {attributeEntries.map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="py-2 pr-4 text-gray-500 w-1/3">{key}</td>
                  <td className="py-2 text-gray-800">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}