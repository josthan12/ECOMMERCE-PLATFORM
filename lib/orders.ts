import { prisma } from '@/lib/prisma'

export async function markOrderFailedAndRestoreStock(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const failedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'PAYMENT_FAILED' },
      include: { items: true },
    })

    for (const item of failedOrder.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { increment: item.quantity } },
      })
    }

    return failedOrder
  })
}