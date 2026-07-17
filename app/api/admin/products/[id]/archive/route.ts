import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { archived } = await req.json()

  if (typeof archived !== 'boolean') {
    return NextResponse.json({ error: 'archived must be true or false' }, { status: 400 })
  }

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const product = await prisma.product.update({ where: { id }, data: { archived } })
  return NextResponse.json(product)
}