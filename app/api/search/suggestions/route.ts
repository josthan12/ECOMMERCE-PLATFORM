import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      product: {
        archived: false,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
    },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          imageUrl: true,
          categoryProducts: {
            select: { category: { select: { name: true } } },
            take: 1,
          },
        },
      },
    },
    orderBy: { product: { createdAt: 'desc' } },
    take: 6,
  })

  const results = variants.map((v) => ({
    id: v.id,
    name: `${v.product.name} - ${(v.combination as { Format?: string })?.Format ?? ''}`,
    slug: v.product.slug,
    imageUrl: v.imageUrl ?? v.product.imageUrl,
    price: `$${v.price.toFixed(2)}`,
    category: v.product.categoryProducts[0]?.category.name ?? null,
  }))

  return NextResponse.json({ results })
}