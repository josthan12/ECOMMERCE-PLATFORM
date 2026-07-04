const GST_RATE = Number(process.env.GST_RATE_PERCENT ?? 9) / 100;

export function calculateGST(subtotal: number): number {
  return Math.round(subtotal * GST_RATE * 100) / 100;
}

export function calculateTotalWithGST(subtotal: number): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const gst = calculateGST(subtotal);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gst,
    total: Math.round((subtotal + gst) * 100) / 100,
  };
}