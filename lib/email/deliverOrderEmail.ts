import type { OrderEmailType } from '@/app/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email/sendOrderEmail'

export const MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS = 5

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message.slice(0, 500)
    : 'Unknown email delivery error.'
}

export async function deliverOrderEmailDelivery(deliveryId: string) {
  const delivery = await prisma.orderEmailDelivery.findUnique({
    where: { id: deliveryId },
    select: {
      id: true,
      orderId: true,
      type: true,
      email: true,
      status: true,
      attemptCount: true,
    },
  })

  if (
    !delivery ||
    delivery.status === 'SENT' ||
    delivery.attemptCount >= MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS
  ) {
    return delivery?.status === 'SENT'
  }

  const claimed = await prisma.orderEmailDelivery.updateMany({
    where: {
      id: delivery.id,
      status: { not: 'SENT' },
      attemptCount: { lt: MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS },
    },
    data: {
      attemptCount: { increment: 1 },
      error: null,
    },
  })

  if (claimed.count === 0) return false

  const idempotencyKey = `order-email/${delivery.orderId}/${delivery.id}`

  try {
    const result =
      delivery.type === 'CONFIRMATION'
        ? await sendOrderConfirmationEmail(
            delivery.orderId,
            delivery.email,
            idempotencyKey
          )
        : await sendPaymentFailedEmail(
            delivery.orderId,
            delivery.email,
            idempotencyKey
          )

    if (result.error || !result.data) {
      throw new Error(result.error?.message || 'Email provider did not accept the email.')
    }

    await prisma.orderEmailDelivery.updateMany({
      where: { id: delivery.id, status: { not: 'SENT' } },
      data: {
        status: 'SENT',
        resendEmailId: result.data.id,
        error: null,
        sentAt: new Date(),
      },
    })

    return true
  } catch (error) {
    await prisma.orderEmailDelivery.updateMany({
      where: { id: delivery.id, status: { not: 'SENT' } },
      data: {
        status: 'FAILED',
        error: errorMessage(error),
      },
    })

    console.error('[order-email] delivery failed', {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      type: delivery.type,
      error: errorMessage(error),
    })
    return false
  }
}

export async function deliverPendingOrderEmailsForOrder(orderId: string) {
  const deliveries = await prisma.orderEmailDelivery.findMany({
    where: {
      orderId,
      status: { in: ['PENDING', 'FAILED'] },
      attemptCount: { lt: MAX_ORDER_EMAIL_DELIVERY_ATTEMPTS },
    },
    select: { id: true },
  })

  return Promise.allSettled(
    deliveries.map((delivery) => deliverOrderEmailDelivery(delivery.id))
  )
}

export function paymentEmailTypeForStatus(
  status: 'PAID' | 'PAYMENT_FAILED'
): OrderEmailType {
  return status === 'PAID' ? 'CONFIRMATION' : 'PAYMENT_FAILED'
}
