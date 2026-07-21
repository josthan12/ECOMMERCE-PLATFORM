const GST_RATE_PERCENT = Number(process.env.NEXT_PUBLIC_GST_RATE_PERCENT ?? 9);
const GST_RATE = GST_RATE_PERCENT / 100;

// Single source of truth for "is GST active at all" — every UI surface
// that shows a GST line (checkout, order confirmation, admin order detail,
// FAQ) should import this rather than checking the env var itself.
export const GST_ENABLED = GST_RATE_PERCENT > 0;
export const GST_RATE_DISPLAY = GST_RATE_PERCENT;

export function calculateGST(amount: number): number {
  if (!GST_ENABLED) return 0;
  return Math.round(amount * GST_RATE * 100) / 100;
}

export function calculateTotalWithGST(
  subtotal: number,
  shippingFee: number = 0
): {
  subtotal: number;
  shippingFee: number;
  gst: number;
  total: number;
} {
  const taxableAmount = subtotal + shippingFee;
  const gst = calculateGST(taxableAmount);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    gst,
    total: Math.round((taxableAmount + gst) * 100) / 100,
  };
}