import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isCatalogImagePath } from '@/lib/catalogImages'

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

  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: { select: { productId: true } } },
  })

  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...category,
    productIds: category.products.map((cp) => cp.productId),
  })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params
  const { name, description, bannerImageUrl, seoTitle, seoDescription, productIds } = await req.json()

  if (!name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!isCatalogImagePath(bannerImageUrl, 'categories')) {
    return NextResponse.json(
      { error: 'A valid local category image path is required' },
      { status: 400 }
    )
  }

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  const category = await prisma.$transaction(async (tx) => {
    await tx.categoryProduct.deleteMany({ where: { categoryId: id } })

    return tx.category.update({
      where: { id },
      data: {
        name,
        description,
        bannerImageUrl,
        seoTitle: seoTitle || name,
        seoDescription,
        products: {
          create: Array.isArray(productIds)
            ? productIds.map((productId: string) => ({ productId }))
            : [],
        },
      },
      include: { products: { include: { product: true } } },
    })
  })

  return NextResponse.json(category)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params

  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  }

  // CategoryProduct cascades automatically — this only unassigns products
  // from this category, never touches the Product rows themselves.
  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
