import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { reconcileOrderIfStale } from '@/lib/reconcileOrder'
import {
  deliverOrderEmailDelivery,
  MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS,
} from '@/lib/email/deliverOrderEmail'

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

  const [staleOrders, pendingEmailDeliveries] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        hitpayPaymentRequestId: { not: null },
        createdAt: { lt: staleCutoff },
      },
      select: { id: true },
    }),
    prisma.orderEmailDelivery.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        attemptCount: { lt: MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS },
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
      take: 25,
    }),
  ])

  const [results, emailResults] = await Promise.all([
    Promise.allSettled(staleOrders.map((o) => reconcileOrderIfStale(o.id))),
    Promise.allSettled(
      pendingEmailDeliveries.map((delivery) =>
        deliverOrderEmailDelivery(delivery.id)
      )
    ),
  ])

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  const emailSucceeded = emailResults.filter(
    (result) => result.status === 'fulfilled' && result.value
  ).length

  return NextResponse.json({
    checked: staleOrders.length,
    succeeded,
    failed,
    emailDeliveries: {
      checked: pendingEmailDeliveries.length,
      succeeded: emailSucceeded,
      failed: pendingEmailDeliveries.length - emailSucceeded,
    },
  })
}
