import { prisma } from '@/lib/prisma'
import { sendPaymentFailedEmail } from '@/lib/email/sendOrderEmail';

export async function markOrderFailedAndRestoreStock(orderId: string) {
  const failedOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: 'PAYMENT_FAILED' },
      include: { items: true },
    })

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { increment: item.quantity } },
      })
    }

    return order
  })

  await sendPaymentFailedEmail(orderId)
  return failedOrder
}