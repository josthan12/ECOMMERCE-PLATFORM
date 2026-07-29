import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isCatalogImagePath } from '@/lib/catalogImages'
import { revalidateStorefront } from '@/lib/revalidateStorefront'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productType: { include: { fields: { orderBy: { order: 'asc' } } } },
      variants: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params
  const { name, description, imageUrl, attributes, variantOptions, variants } = await req.json()

  if (!name) {
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

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: { select: { id: true } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // productTypeId and slug are intentionally NOT accepted here — see decisions
  // above. Only fields explicitly destructured below can change.

  const submittedIds = variants.filter((v: any) => v.id).map((v: any) => v.id)
  const idsToDelete = existing.variants
    .map((v) => v.id)
    .filter((existingId) => !submittedIds.includes(existingId))

  const toUpdate = variants.filter((v: any) => v.id)
  const toCreate = variants.filter((v: any) => !v.id)

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      imageUrl: imageUrl || null,
      attributes: attributes || {},
      variantOptions: variantOptions || {},
      variants: {
        deleteMany: { id: { in: idsToDelete } },
        update: toUpdate.map((v: any) => ({
          where: { id: v.id },
          data: {
            combination: v.combination,
            price: parseFloat(v.price),
            stock: parseInt(v.stock, 10),
            sku: v.sku || null,
            imageUrl: v.imageUrl || null,
          },
        })),
        create: toCreate.map((v: any) => ({
          combination: v.combination,
          price: parseFloat(v.price),
          stock: parseInt(v.stock, 10),
          sku: v.sku || null,
          imageUrl: v.imageUrl || null,
        })),
      },
    },
    include: { variants: true },
  })

  revalidateStorefront()

  return NextResponse.json(product)
}
