'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { calculateTotalWithGST } from '@/lib/gst'
import { validateShippingAddress } from '@/lib/validateAddress'
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import Button from '../components/ui/Button'

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [fulfillmentMethod, setFulfillmentMethod] = useState<'DELIVERY' | 'SELF_COLLECTION'>('DELIVERY')
  const [fees, setFees] = useState<{ delivery: number; selfCollection: number } | null>(null)

  const [block, setBlock] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/checkout/fulfillment-fees')
      .then((res) => res.json())
      .then(setFees)
      .catch(() => setFees({ delivery: 5.5, selfCollection: 0 })) // fallback if the fetch fails
  }, [])

  if (items.length === 0) {
    return <p className="mt-6 text-text-muted">No items in cart.</p>
  }

  const estimatedSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const currentFee = fees
    ? fulfillmentMethod === 'SELF_COLLECTION'
      ? fees.selfCollection
      : fees.delivery
    : 0
  const { subtotal, gst, total, shippingFee } = calculateTotalWithGST(estimatedSubtotal, currentFee)

  async function handlePlaceOrder() {
    setError(null)

    const validationError = validateShippingAddress({
      fulfillmentMethod,
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
          fulfillmentMethod,
          shippingBlock: fulfillmentMethod === 'SELF_COLLECTION' ? null : block,
          shippingUnitNumber: fulfillmentMethod === 'SELF_COLLECTION' ? null : (unitNumber || null),
          shippingStreet: fulfillmentMethod === 'SELF_COLLECTION' ? null : street,
          shippingPostalCode: fulfillmentMethod === 'SELF_COLLECTION' ? null : postalCode,
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
    <div className="mt-6">
      <section>
        <h2 className="font-medium text-text">Fulfillment</h2>
        <div className="mt-3 flex flex-col gap-3">
          {(['DELIVERY', 'SELF_COLLECTION'] as const).map((method) => (
            <label
              key={method}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-md border px-4 py-3 transition-colors duration-150 ease-out',
                fulfillmentMethod === method
                  ? 'border-accent bg-accent-light/40'
                  : 'border-border hover:border-border-strong'
              )}
            >
              <span className="flex items-center gap-2.5 text-text">
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  checked={fulfillmentMethod === method}
                  onChange={() => setFulfillmentMethod(method)}
                  className="h-4 w-4 accent-primary"
                />
                {method === 'DELIVERY' ? 'Delivery' : 'Self Collection'}
              </span>
              <span className="text-sm text-text-muted">
                {fees
                  ? method === 'DELIVERY'
                    ? `$${fees.delivery.toFixed(2)}`
                    : fees.selfCollection === 0
                      ? 'Free'
                      : `$${fees.selfCollection.toFixed(2)}`
                  : '…'}
              </span>
            </label>
          ))}
          {fulfillmentMethod === 'SELF_COLLECTION' && (
            <p className="pl-1 text-xs text-text-muted">
              Pickup location: {SELF_COLLECTION_ADDRESS}
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-medium text-text">Order Summary</h2>
        <div className="mt-3 rounded-lg border border-border-light bg-surface p-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between py-1 text-sm text-text">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-3 space-y-1.5 border-t border-border-light pt-3 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>{fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping'}</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>GST (9%)</span>
              <span>${gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border-light pt-1.5 font-semibold text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-text-light">
          Final price and stock confirmed at order placement.
        </p>
      </section>

      {fulfillmentMethod === 'DELIVERY' && (
        <section className="mt-8">
          <h2 className="font-medium text-text">Shipping Address</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="block" className="sr-only">Block / Building No.</label>
                <input
                  id="block"
                  placeholder="Block / Building No."
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="unitNumber" className="sr-only">Unit Number (optional)</label>
                <input
                  id="unitNumber"
                  placeholder="Unit Number (optional)"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="street" className="sr-only">Street</label>
              <input
                id="street"
                placeholder="Street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="sr-only">Postal Code</label>
              <input
                id="postalCode"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </section>
      )}

      {error && (
        <p className="mt-6 flex items-center gap-1.5 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button
        onClick={handlePlaceOrder}
        disabled={submitting}
        className="mt-6 w-full gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Placing Order…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Place Order
          </>
        )}
      </Button>
    </div>
  )
}