'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Tag,
  Truck,
  X,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { calculateTotalWithGST, GST_ENABLED, GST_RATE_DISPLAY } from '@/lib/gst'
import { validateShippingAddress } from '@/lib/validateAddress'
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import Button from '../components/ui/Button'

type FulfillmentFees = {
  delivery: number
  selfCollection: number
}

async function fetchFulfillmentFees(): Promise<FulfillmentFees> {
  const response = await fetch('/api/checkout/fulfillment-fees')
  if (!response.ok) throw new Error('FEE_REQUEST_FAILED')

  const data = await response.json()
  const delivery = Number(data.delivery)
  const selfCollection = Number(data.selfCollection)

  if (
    !Number.isFinite(delivery) ||
    !Number.isFinite(selfCollection) ||
    delivery < 0 ||
    selfCollection < 0
  ) {
    throw new Error('INVALID_FEES')
  }

  return { delivery, selfCollection }
}

export default function CheckoutForm() {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    'DELIVERY' | 'SELF_COLLECTION'
  >('DELIVERY')
  const [fees, setFees] = useState<FulfillmentFees | null>(null)
  const [feesLoading, setFeesLoading] = useState(true)
  const [feesError, setFeesError] = useState<string | null>(null)

  const [block, setBlock] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discountAmount: number
  } | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetchFulfillmentFees()
      .then((loadedFees) => {
        if (!active) return
        setFees(loadedFees)
      })
      .catch(() => {
        if (!active) return
        setFees(null)
        setFeesError('Delivery options could not be loaded. Please try again.')
      })
      .finally(() => {
        if (active) setFeesLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleRetryFees() {
    setFeesLoading(true)
    setFeesError(null)

    try {
      setFees(await fetchFulfillmentFees())
    } catch {
      setFees(null)
      setFeesError('Delivery options could not be loaded. Please try again.')
    } finally {
      setFeesLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-border-light bg-surface p-8 text-center shadow-card">
        <p className="font-display text-xl font-semibold text-primary">
          No items in your cart.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Return to the catalogue before starting checkout.
        </p>
      </div>
    )
  }

  const estimatedSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const currentFee = fees
    ? fulfillmentMethod === 'SELF_COLLECTION'
      ? fees.selfCollection
      : fees.delivery
    : 0
  const discountAmount = appliedPromo?.discountAmount ?? 0
  const discountedSubtotal = Math.max(estimatedSubtotal - discountAmount, 0)
  const { gst, total, shippingFee } = calculateTotalWithGST(
    discountedSubtotal,
    currentFee
  )

  async function handleApplyPromo() {
    setPromoError(null)
    const trimmed = promoCodeInput.trim()
    if (!trimmed) {
      setPromoError('Enter a promo code first.')
      return
    }

    setPromoLoading(true)
    try {
      const response = await fetch('/api/checkout/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotal: estimatedSubtotal }),
      })
      const data = await response.json()

      if (!response.ok) {
        setPromoError(data.error || 'Invalid promo code.')
        setAppliedPromo(null)
        return
      }

      setAppliedPromo({
        code: data.code,
        discountAmount: data.discountAmount,
      })
    } catch {
      setPromoError('Network error. Please try again.')
    } finally {
      setPromoLoading(false)
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null)
    setPromoCodeInput('')
    setPromoError(null)
  }

  async function handlePlaceOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!fees) {
      setError('Delivery options must load before you can continue.')
      return
    }

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
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          fulfillmentMethod,
          shippingBlock: fulfillmentMethod === 'SELF_COLLECTION' ? null : block,
          shippingUnitNumber:
            fulfillmentMethod === 'SELF_COLLECTION'
              ? null
              : unitNumber || null,
          shippingStreet:
            fulfillmentMethod === 'SELF_COLLECTION' ? null : street,
          shippingPostalCode:
            fulfillmentMethod === 'SELF_COLLECTION' ? null : postalCode,
          promoCode: appliedPromo?.code ?? null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
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
    <form
      className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_24rem]"
      onSubmit={handlePlaceOrder}
    >
      <div className="space-y-6">
        <fieldset className="rounded-2xl border border-border-light bg-surface p-5 shadow-card sm:p-6">
          <legend className="px-1 font-display text-xl font-semibold text-primary">
            Fulfillment
          </legend>
          <p className="mt-1 text-sm text-text-muted">
            Choose delivery or collect your order in person.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(['DELIVERY', 'SELF_COLLECTION'] as const).map((method) => {
              const selected = fulfillmentMethod === method
              const label = method === 'DELIVERY' ? 'Delivery' : 'Self collection'
              const fee = fees
                ? method === 'DELIVERY'
                  ? fees.delivery
                  : fees.selfCollection
                : null

              return (
                <label
                  key={method}
                  className={cn(
                    'cursor-pointer rounded-xl border p-4 transition-colors',
                    selected
                      ? 'border-accent bg-accent/15'
                      : 'border-border bg-background hover:border-border-strong'
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="fulfillmentMethod"
                        value={method}
                        checked={selected}
                        onChange={() => {
                          setFulfillmentMethod(method)
                          setError(null)
                        }}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-text">
                          {label}
                        </span>
                        <span className="mt-1 block text-xs text-text-muted">
                          {method === 'DELIVERY'
                            ? 'Sent to your Singapore address'
                            : 'Collect from our pickup location'}
                        </span>
                      </span>
                    </span>
                    {method === 'DELIVERY' ? (
                      <Truck className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    ) : (
                      <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    )}
                  </span>
                  <span className="mt-4 block text-sm font-semibold text-primary">
                    {feesLoading
                      ? 'Loading…'
                      : fee == null
                        ? 'Unavailable'
                        : fee === 0
                          ? 'Free'
                          : `$${fee.toFixed(2)}`}
                  </span>
                </label>
              )
            })}
          </div>

          {feesError && (
            <div
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error/30 bg-error/5 p-3"
              role="alert"
            >
              <p className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {feesError}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleRetryFees()}
                disabled={feesLoading}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry
              </Button>
            </div>
          )}

          {fulfillmentMethod === 'SELF_COLLECTION' && (
            <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm leading-6 text-text-muted">
              <span className="font-medium text-text">Pickup location:</span>{' '}
              {SELF_COLLECTION_ADDRESS}
            </p>
          )}
        </fieldset>

        {fulfillmentMethod === 'DELIVERY' && (
          <section className="rounded-2xl border border-border-light bg-surface p-5 shadow-card sm:p-6">
            <h2 className="font-display text-xl font-semibold text-primary">
              Shipping address
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Singapore delivery only.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="block" className="mb-1.5 block text-sm font-medium text-text">
                  Block or building number
                </label>
                <input
                  id="block"
                  name="block"
                  required
                  maxLength={4}
                  autoComplete="address-line1"
                  placeholder="e.g. 123A"
                  value={block}
                  onChange={(event) => setBlock(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="unitNumber" className="mb-1.5 block text-sm font-medium text-text">
                  Unit number <span className="text-text-light">(optional)</span>
                </label>
                <input
                  id="unitNumber"
                  name="unitNumber"
                  autoComplete="address-line2"
                  placeholder="e.g. #03-12"
                  value={unitNumber}
                  onChange={(event) => setUnitNumber(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-text">
                  Street
                </label>
                <input
                  id="street"
                  name="street"
                  required
                  placeholder="Street name"
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-text">
                  Postal code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  placeholder="6-digit postal code"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border-light bg-surface p-5 shadow-card sm:p-6">
          <h2 className="font-display text-xl font-semibold text-primary">
            Promo code
          </h2>
          <div className="mt-4">
            {appliedPromo ? (
              <div className="flex items-center justify-between rounded-lg border border-accent bg-accent/15 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Tag className="h-4 w-4" aria-hidden="true" />
                  {appliedPromo.code} applied
                </span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="flex h-10 w-10 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-error"
                  aria-label="Remove promo code"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="promoCode" className="sr-only">
                  Promo code
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="promoCode"
                    type="text"
                    value={promoCodeInput}
                    onChange={(event) => setPromoCodeInput(event.target.value)}
                    placeholder="Enter code"
                    className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm uppercase text-text placeholder:text-text-light placeholder:normal-case focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleApplyPromo}
                    disabled={promoLoading}
                    className="min-w-28"
                  >
                    {promoLoading ? 'Checking…' : 'Apply'}
                  </Button>
                </div>
              </div>
            )}
            <div aria-live="polite">
              {promoError && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-error">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {promoError}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-semibold text-primary">
          Order summary
        </h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-4 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-text">
                  {item.productName} × {item.quantity}
                </p>
                {Object.keys(item.combination).length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {Object.values(item.combination).join(' · ')}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-text">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border-light pt-5 text-sm">
          <div className="flex justify-between text-text-muted">
            <dt>Subtotal</dt>
            <dd>${estimatedSubtotal.toFixed(2)}</dd>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-success">
              <dt>Discount ({appliedPromo.code})</dt>
              <dd>-${discountAmount.toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between text-text-muted">
            <dt>
              {fulfillmentMethod === 'SELF_COLLECTION'
                ? 'Self collection'
                : 'Shipping'}
            </dt>
            <dd>
              {feesLoading
                ? 'Loading…'
                : fees
                  ? shippingFee === 0
                    ? 'Free'
                    : `$${shippingFee.toFixed(2)}`
                  : '—'}
            </dd>
          </div>
          {GST_ENABLED && (
            <div className="flex justify-between text-text-muted">
              <dt>GST ({GST_RATE_DISPLAY}%)</dt>
              <dd>${gst.toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border-light pt-3 font-display text-xl font-semibold text-primary">
            <dt>Total</dt>
            <dd>{fees ? `$${total.toFixed(2)}` : '—'}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-5 text-text-light">
          Final price, promotion eligibility, and stock are confirmed again
          before payment.
        </p>

        <div aria-live="assertive">
          {error && (
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting || feesLoading || !fees}
          className="mt-6 w-full gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Preparing payment…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Continue to payment
            </>
          )}
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-text-light">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          Payment is completed securely through HitPay.
        </p>
      </aside>
    </form>
  )
}
