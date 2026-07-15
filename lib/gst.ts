const GST_RATE = Number(process.env.GST_RATE_PERCENT ?? 9) / 100;

export function calculateGST(amount: number): number {
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