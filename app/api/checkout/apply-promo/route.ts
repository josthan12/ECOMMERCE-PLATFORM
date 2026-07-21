import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { computeDiscountAmount } from '@/lib/promoCode'

// Preview/validation only. The code is only ever actually marked used
// inside /api/checkout's own transaction, at the moment a real Order is
// created — same reasoning as price/stock being re-verified live rather
// than trusted from an earlier client call.
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { code, subtotal } = body

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'A promo code is required.' }, { status: 400 })
  }
  if (typeof subtotal !== 'number' || subtotal < 0) {
    return NextResponse.json({ error: 'Invalid subtotal.' }, { status: 400 })
  }

  const normalizedCode = code.trim().toUpperCase()
  const promo = await prisma.promoCode.findUnique({ where: { code: normalizedCode } })

  if (!promo || !promo.active || promo.usedAt) {
    return NextResponse.json({ error: 'This promo code is invalid or has already been used.' }, { status: 400 })
  }

  if (promo.minOrderValue != null && subtotal < promo.minOrderValue) {
    return NextResponse.json(
      { error: `This code requires a minimum order of $${promo.minOrderValue.toFixed(2)}.` },
      { status: 400 }
    )
  }

  const discountAmount = computeDiscountAmount(promo, subtotal)

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discountAmount,
  })
}