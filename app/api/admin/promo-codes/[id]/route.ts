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

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const promoCode = await prisma.promoCode.findUnique({ where: { id } })
  if (!promoCode) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })

  return NextResponse.json(promoCode)
}

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const existing = await prisma.promoCode.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })

  const body = await request.json()
  const { code, discountType, discountValue, minOrderValue, maxDiscountAmount, active } = body

  if (!code || !discountType || discountValue === undefined || discountValue === null) {
    return NextResponse.json({ error: 'code, discountType, and discountValue are required' }, { status: 400 })
  }
  if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED_AMOUNT') {
    return NextResponse.json({ error: 'discountType must be PERCENTAGE or FIXED_AMOUNT' }, { status: 400 })
  }

  const parsedValue = parseFloat(discountValue)
  if (isNaN(parsedValue) || parsedValue <= 0) {
    return NextResponse.json({ error: 'discountValue must be a positive number' }, { status: 400 })
  }
  if (discountType === 'PERCENTAGE' && parsedValue > 100) {
    return NextResponse.json({ error: 'Percentage discount cannot exceed 100' }, { status: 400 })
  }

  const parsedMinOrderValue =
    minOrderValue !== undefined && minOrderValue !== null && minOrderValue !== ''
      ? parseFloat(minOrderValue)
      : null
  if (parsedMinOrderValue !== null && (isNaN(parsedMinOrderValue) || parsedMinOrderValue < 0)) {
    return NextResponse.json({ error: 'minOrderValue must be a non-negative number' }, { status: 400 })
  }

  const parsedMaxDiscountAmount =
    maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount !== ''
      ? parseFloat(maxDiscountAmount)
      : null
  if (parsedMaxDiscountAmount !== null && (isNaN(parsedMaxDiscountAmount) || parsedMaxDiscountAmount < 0)) {
    return NextResponse.json({ error: 'maxDiscountAmount must be a non-negative number' }, { status: 400 })
  }

  const normalizedCode = code.trim().toUpperCase()
  if (!normalizedCode) {
    return NextResponse.json({ error: 'code cannot be empty' }, { status: 400 })
  }

  if (normalizedCode !== existing.code) {
    const codeConflict = await prisma.promoCode.findUnique({ where: { code: normalizedCode } })
    if (codeConflict) {
      return NextResponse.json({ error: 'A promo code with this code already exists' }, { status: 400 })
    }
  }

  const promoCode = await prisma.promoCode.update({
    where: { id },
    data: {
      code: normalizedCode,
      discountType,
      discountValue: parsedValue,
      minOrderValue: parsedMinOrderValue,
      maxDiscountAmount: parsedMaxDiscountAmount,
      active: active ?? existing.active,
    },
  })

  return NextResponse.json(promoCode)
}

export async function DELETE(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const existing = await prisma.promoCode.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })

  await prisma.promoCode.delete({ where: { id } })

  return NextResponse.json({ success: true })
}