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

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <BackButton />

      <div className="mt-4 md:mt-6">
        <ProductGallery
          productId={product.id}
          productName={product.name}
          productSlug={product.slug}
          description={product.description}
          attributes={attributes}
          variantOptions={variantOptions}
          variants={product.variants}
          fallbackImageUrl={product.imageUrl}
        />
      </div>
    </div>
  )
}