import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isCatalogImagePath } from '@/lib/catalogImages'
import { revalidateStorefront } from '@/lib/revalidateStorefront'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const category = await prisma.category.create({
    data: {
      name,
      slug,
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

  revalidateStorefront()

  return NextResponse.json(category)
}
