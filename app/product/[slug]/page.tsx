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

  if (!product || product.archived) {
    notFound()
  }

  const attributes = (product.attributes ?? {}) as Record<string, unknown>
  const variantOptions = (product.variantOptions ?? {}) as Record<string, string[]>
  const attributeEntries = Object.entries(attributes)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <BackButton />

      <div className="mt-4 grid gap-10 md:mt-6 md:grid-cols-2 md:gap-14">
        <ProductGallery
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          variantOptions={variantOptions}
          variants={product.variants}
          fallbackImageUrl={product.imageUrl}
        />

        <div>
          <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-3 leading-relaxed text-text-muted">{product.description}</p>
          )}
        </div>
      </div>

      {attributeEntries.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl font-semibold text-primary">Specifications</h2>
          <table className="mt-4 w-full border-t border-border-light text-sm">
            <tbody>
              {attributeEntries.map(([key, value]) => (
                <tr key={key} className="border-b border-border-light">
                  <td className="w-1/3 py-3 pr-4 text-text-muted">{key}</td>
                  <td className="py-3 text-text">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}