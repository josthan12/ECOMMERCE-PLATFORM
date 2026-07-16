import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/app/components/ProductCard'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      variants: { select: { price: true, stock: true } },
      categoryProducts: {
        select: { category: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const results = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl,
    price: formatPrice(p.variants),
    category: p.categoryProducts[0]?.category.name ?? null,
  }))

  return NextResponse.json({ results })
}