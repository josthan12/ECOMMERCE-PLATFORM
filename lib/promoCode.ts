// Single source of truth for discount calculation, used by both the
// checkout preview endpoint and the real order-creation transaction — kept
// as one function specifically so the two can never drift apart, the same
// class of bug this project hit with duplicated STATUS_STYLES definitions.
interface DiscountablePromo {
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  maxDiscountAmount: number | null
}

export function computeDiscountAmount(promo: DiscountablePromo, subtotal: number): number {
  let discountAmount =
    promo.discountType === 'PERCENTAGE' ? subtotal * (promo.discountValue / 100) : promo.discountValue

  if (promo.maxDiscountAmount != null) {
    discountAmount = Math.min(discountAmount, promo.maxDiscountAmount)
  }
  discountAmount = Math.min(discountAmount, subtotal)

  return Math.round(discountAmount * 100) / 100
}