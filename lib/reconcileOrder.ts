import { prisma } from '@/lib/prisma'
import { markOrderFailedAndRestoreStock } from '@/lib/orders'
import { recordDiscountExpenseIfApplicable } from '@/lib/recordDiscountExpense'

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
    const updated = await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
    await recordDiscountExpenseIfApplicable(orderId)
    return updated
  }

  if (['failed', 'canceled', 'expired'].includes(hitpayData.status)) {
    return markOrderFailedAndRestoreStock(orderId)
  }

  return order
}