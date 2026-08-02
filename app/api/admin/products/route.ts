import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isCatalogImagePath } from '@/lib/catalogImages'
import { revalidateStorefront } from '@/lib/revalidateStorefront'
import { Prisma } from '@/app/generated/prisma/client'

type ProductVariantInput = {
  combination: Prisma.InputJsonObject
  price: string | number
  stock: string | number
  sku?: string | null
  imageUrl?: string | null
}

type ProductInput = {
  name?: string
  description?: string | null
  imageUrl?: string | null
  productTypeId?: string
  attributes?: Prisma.InputJsonObject
  variantOptions?: Prisma.InputJsonObject
  variants: ProductVariantInput[]
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const products = await prisma.product.findMany({
    include: { productType: true, variants: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const {
    name,
    description,
    imageUrl,
    productTypeId,
    attributes,
    variantOptions,
    variants,
  } = (await req.json()) as ProductInput

  if (!name || !productTypeId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!isCatalogImagePath(imageUrl, 'products')) {
    return NextResponse.json(
      { error: 'A valid local product image path is required' },
      { status: 400 }
    )
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    return NextResponse.json({ error: 'At least one variant is required' }, { status: 400 })
  }

  for (const v of variants) {
    if (v.price === undefined || v.price === '' || v.stock === undefined || v.stock === '') {
      return NextResponse.json({ error: 'Every variant needs a price and stock value' }, { status: 400 })
    }
    if (v.imageUrl && !isCatalogImagePath(v.imageUrl, 'variants')) {
      return NextResponse.json(
        { error: 'Every variant image must use a valid local variant image path' },
        { status: 400 }
      )
    }
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      imageUrl: imageUrl || null,
      productTypeId,
      attributes: attributes || {},
      variantOptions: variantOptions || {},
      variants: {
        create: variants.map((variant) => ({
          combination: variant.combination,
          price: Number.parseFloat(String(variant.price)),
          stock: Number.parseInt(String(variant.stock), 10),
          sku: variant.sku || null,
          imageUrl: variant.imageUrl || null,
        })),
      },
    },
    include: { variants: true },
  })

  revalidateStorefront()

  return NextResponse.json(product)
}
