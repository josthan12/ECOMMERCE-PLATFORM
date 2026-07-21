import { prisma } from '@/lib/prisma'

// Called whenever an Order transitions to PAID, from either the HitPay
// webhook or the reconciliation path. If a promo code was applied, logs the
// discount as a real Expense — only once the sale is genuinely real, same
// "don't count it until it's actually happened" principle already applied
// to Total Revenue elsewhere on the dashboard.
export async function recordDiscountExpenseIfApplicable(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { discountAmount: true, promoCode: true },
  })

  if (!order || !order.discountAmount || order.discountAmount <= 0) return

  await prisma.expense.create({
    data: {
      title: `Promo discount — ${order.promoCode ?? 'unknown code'} — Order ${orderId.slice(0, 8)}`,
      category: 'Promotion',
      amount: order.discountAmount,
      incurredAt: new Date(),
      isSystemGenerated: true,
    },
  })
}