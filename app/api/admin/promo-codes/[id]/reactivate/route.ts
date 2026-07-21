import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const existing = await prisma.promoCode.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })

  const promoCode = await prisma.promoCode.update({
    where: { id },
    data: { usedAt: null, usedByOrderId: null },
  })

  return NextResponse.json(promoCode)
}