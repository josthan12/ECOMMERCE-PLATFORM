import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reconcileOrderIfStale } from '@/lib/reconcileOrder'

// How old an order must be (minutes since creation) before we bother
// checking it against HitPay — matches the 5-minute payment request expiry
// plus a small buffer, so we don't waste API calls on orders still actively
// being paid.
const STALE_THRESHOLD_MINUTES = 6

export async function GET(request: NextRequest) {
  const providedSecret =
    request.headers.get('authorization')?.replace('Bearer ', '') ??
    request.nextUrl.searchParams.get('secret')

  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const staleCutoff = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000)

  const staleOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      hitpayPaymentRequestId: { not: null },
      createdAt: { lt: staleCutoff },
    },
    select: { id: true },
  })

  const results = await Promise.allSettled(
    staleOrders.map((o) => reconcileOrderIfStale(o.id))
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({
    checked: staleOrders.length,
    succeeded,
    failed,
  })
}