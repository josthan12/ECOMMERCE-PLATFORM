import { prisma } from '@/lib/prisma'
import { transitionOrderPayment } from '@/lib/payments/transitionOrderPayment'

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
    return transitionOrderPayment(orderId, 'PAID')
  }

  if (['failed', 'canceled', 'expired'].includes(hitpayData.status)) {
    return transitionOrderPayment(orderId, 'PAYMENT_FAILED')
  }

  return order
}
