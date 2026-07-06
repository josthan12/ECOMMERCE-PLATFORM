'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { calculateTotalWithGST } from '@/lib/gst'
import { validateShippingAddress } from '@/lib/validateAddress'

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const router = useRouter()

  const [block, setBlock] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return <p className="text-gray-500">No items in cart.</p>
  }

  const estimatedSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const { subtotal, gst, total } = calculateTotalWithGST(estimatedSubtotal)

  async function handlePlaceOrder() {
    setError(null)

    const validationError = validateShippingAddress({
        shippingBlock: block,
        shippingUnitNumber: unitNumber,
        shippingStreet: street,
        shippingPostalCode: postalCode,
    })
    if (validationError) {
        setError(validationError)
        return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingBlock: block,
          shippingUnitNumber: unitNumber || null,
          shippingStreet: street,
          shippingPostalCode: postalCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      clearCart()
      window.location.href = data.checkoutUrl
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-medium mb-2">Order Summary</h2>
        {items.map((item) => (
          <div key={item.variantId} className="flex justify-between text-sm py-1">
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (9%)</span>
            <span>${gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Final price and stock confirmed at order placement.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-medium mb-2">Shipping Address</h2>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Block / Building No."
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
          <input
            placeholder="Unit Number (optional)"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
          <input
            placeholder="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
          <input
            placeholder="Postal Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={submitting}
        className="w-full bg-black text-white py-2.5 rounded disabled:bg-gray-300"
      >
        {submitting ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  )
}