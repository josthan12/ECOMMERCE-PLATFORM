import { prisma } from '@/lib/prisma'
import {
  deliverPendingOrderEmailsForOrder,
  paymentEmailTypeForStatus,
} from '@/lib/email/deliverOrderEmail'

export type PaymentTerminalStatus = 'PAID' | 'PAYMENT_FAILED'

const orderSummarySelect = {
  id: true,
  userId: true,
  status: true,
  hitpayPaymentRequestId: true,
} as const

export async function transitionOrderPayment(
  orderId: string,
  targetStatus: PaymentTerminalStatus
) {
  const order = await prisma.$transaction(async (tx) => {
    const transition = await tx.order.updateMany({
      where: { id: orderId, status: 'PENDING_PAYMENT' },
      data: { status: targetStatus },
    })

    if (transition.count === 0) {
      return tx.order.findUnique({
        where: { id: orderId },
        select: orderSummarySelect,
      })
    }

    const transitionedOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { email: true } },
      },
    })

    if (!transitionedOrder) {
      throw new Error(`Order ${orderId} disappeared during payment transition.`)
    }

    if (targetStatus === 'PAYMENT_FAILED') {
      for (const item of transitionedOrder.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }

    if (targetStatus === 'PAID' && transitionedOrder.discountAmount > 0) {
      await tx.expense.create({
        data: {
          title: `Promo discount — ${transitionedOrder.promoCode ?? 'unknown code'} — Order ${orderId.slice(0, 8)}`,
          category: 'Promotion',
          amount: transitionedOrder.discountAmount,
          incurredAt: new Date(),
          isSystemGenerated: true,
        },
      })
    }

    await tx.orderEmailDelivery.create({
      data: {
        orderId,
        type: paymentEmailTypeForStatus(targetStatus),
        email: transitionedOrder.user.email,
      },
    })

    return {
      id: transitionedOrder.id,
      userId: transitionedOrder.userId,
      status: transitionedOrder.status,
      hitpayPaymentRequestId: transitionedOrder.hitpayPaymentRequestId,
    }
  })

  if (!order) return null

  try {
    await deliverPendingOrderEmailsForOrder(order.id)
  } catch (error) {
    console.error('[order-email] could not start delivery attempt', {
      orderId: order.id,
      error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email error.',
    })
  }

  return order
}
