import { prisma } from '@/lib/prisma'
import { markOrderFailedAndRestoreStock } from '@/lib/orders'

// Checks one order's real status against HitPay and reconciles it if the
// order is stale (still PENDING_PAYMENT locally but HitPay has already
// moved on). Used by both /checkout/success (page-load-triggered) and the
// scheduled reconciliation route (time-triggered, catches customers who
// never revisit the confirmation page — e.g. browser Back button, which
// bypasses redirect_url entirely).
export async function reconcileOrderIfStale(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order || order.status !== 'PENDING_PAYMENT' || !order.hitpayPaymentRequestId) {
    return order
  }

  const res = await fetch(
    `${process.env.HITPAY_API_BASE_URL}/payment-requests/${order.hitpayPaymentRequestId}`,
    { headers: { 'X-BUSINESS-API-KEY': process.env.HITPAY_API_KEY! }, cache: 'no-store' }
  )

  if (!res.ok) {
    return order
  }

  const hitpayData = await res.json()

  if (hitpayData.status === 'completed') {
    return prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
  }

  if (['failed', 'canceled', 'expired'].includes(hitpayData.status)) {
    return markOrderFailedAndRestoreStock(orderId)
  }

  return order
}