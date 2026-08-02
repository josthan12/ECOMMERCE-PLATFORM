import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  XCircle,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { reconcileOrderIfStale } from '@/lib/reconcileOrder'
import { GST_ENABLED } from '@/lib/gst'
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Checkout status',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{
    orderId?: string
    status?: string
    reference?: string
  }>
}

type StatusPanelProps = {
  title: string
  orderId: string
  message: string
  tone: 'success' | 'pending' | 'error'
  action?: {
    href: string
    label: string
  }
}

function StatusPanel({
  title,
  orderId,
  message,
  tone,
  action,
}: StatusPanelProps) {
  const Icon =
    tone === 'success' ? CheckCircle2 : tone === 'error' ? XCircle : Clock3
  const iconClassName =
    tone === 'success'
      ? 'text-success'
      : tone === 'error'
        ? 'text-error'
        : 'text-warning'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-16">
      <section className="w-full rounded-2xl border border-border-light bg-surface p-7 text-center shadow-card sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border-light bg-surface-muted">
          <Icon className={`h-8 w-8 ${iconClassName}`} aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-[-0.03em] text-primary">
          {title}
        </h1>
        <p className="mt-2 text-xs font-semibold tracking-[0.1em] text-text-light uppercase">
          Order {orderId}
        </p>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-text-muted">
          {message}
        </p>
        {action && (
          <Link
            href={action.href}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {action.label}
          </Link>
        )}
      </section>
    </div>
  )
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId, status, reference } = await searchParams

  if (!orderId) {
    notFound()
  }

  const { userId: clerkId } = await auth()

  if (!clerkId) {
    // QR-based payments may return on another device. Only reveal a positive
    // payment result when HitPay's own reference matches this stored request.
    let verifiedPaid = false

    if (reference) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { hitpayPaymentRequestId: true, status: true },
      })
      verifiedPaid =
        !!order &&
        order.hitpayPaymentRequestId === reference &&
        order.status === 'PAID'
    }

    const signInParams = new URLSearchParams({ orderId })
    if (status) signInParams.set('status', status)
    if (reference) signInParams.set('reference', reference)
    const redirectUrl = encodeURIComponent(
      `/checkout/success?${signInParams.toString()}`
    )

    return (
      <StatusPanel
        title={verifiedPaid ? 'Payment received' : 'Confirming payment'}
        orderId={orderId}
        message={
          verifiedPaid
            ? "We've received your payment. A confirmation email is on its way; check your spam folder if it does not arrive shortly."
            : "We're finalizing your order status. You will receive an email confirmation once it is complete."
        }
        tone={verifiedPaid ? 'success' : 'pending'}
        action={{
          href: `/sign-in?redirect_url=${redirectUrl}`,
          label: 'Sign in to view order',
        }}
      />
    )
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    notFound()
  }

  const ownedOrder = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true },
  })
  if (!ownedOrder) {
    notFound()
  }

  const reconciled = await reconcileOrderIfStale(orderId)

  if (!reconciled || reconciled.userId !== user.id) {
    notFound()
  }

  // This remains cosmetic and read-only. A webhook may still confirm payment
  // if the customer completed the PayNow scan before navigating back.
  const showCosmeticCancel =
    status === 'canceled' && reconciled.status === 'PENDING_PAYMENT'

  if (showCosmeticCancel) {
    return (
      <StatusPanel
        title="Payment cancelled"
        orderId={orderId}
        message="If you completed payment before returning, this status may still update. Refresh after completing payment, and do not pay again using the same QR code."
        tone="error"
        action={{ href: '/account/orders', label: 'View my orders' }}
      />
    )
  }

  const messages: Record<string, string> = {
    PENDING_PAYMENT: 'We are confirming your payment status.',
    PAYMENT_FAILED: 'Payment was not completed. Your order has not been placed.',
  }

  if (reconciled.status !== 'PAID') {
    return (
      <StatusPanel
        title={
          reconciled.status === 'PAYMENT_FAILED'
            ? 'Payment not completed'
            : 'Confirming payment'
        }
        orderId={orderId}
        message={
          messages[reconciled.status] ??
          'We are confirming your payment status.'
        }
        tone={reconciled.status === 'PAYMENT_FAILED' ? 'error' : 'pending'}
        action={{ href: '/account/orders', label: 'View my orders' }}
      />
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/10 text-success">
          <PackageCheck className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-accent uppercase">
          Payment received
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] text-primary">
          Your order is confirmed.
        </h1>
        <p className="mt-3 text-sm text-text-muted">Order {order.id}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="rounded-2xl border border-border-light bg-surface p-5 shadow-card sm:p-6">
          <h2 className="font-display text-xl font-semibold text-primary">
            Items
          </h2>
          <div className="mt-4 divide-y divide-border-light">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-5 py-4 text-sm">
                <div>
                  <p className="font-medium text-text">{item.productName}</p>
                  <p className="mt-1 text-text-muted">
                    {Object.entries(
                      (item.combination as Record<string, string>) ?? {}
                    )
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' · ')}
                  </p>
                  <p className="mt-1 text-xs text-text-light">
                    Quantity {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-medium text-text">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border-light pt-5">
            <h2 className="font-display text-lg font-semibold text-primary">
              {order.fulfillmentMethod === 'SELF_COLLECTION'
                ? 'Self collection'
                : 'Shipping address'}
            </h2>
            {order.fulfillmentMethod === 'SELF_COLLECTION' ? (
              <p className="mt-2 text-sm leading-6 text-text-muted">
                {SELF_COLLECTION_ADDRESS}
              </p>
            ) : (
              <address className="mt-2 text-sm leading-6 text-text-muted not-italic">
                Block {order.shippingBlock}
                {order.shippingUnitNumber
                  ? `, ${order.shippingUnitNumber}`
                  : ''}
                <br />
                {order.shippingStreet}
                <br />
                Singapore {order.shippingPostalCode}
              </address>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="font-display text-xl font-semibold text-primary">
            Total
          </h2>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-text-muted">
              <dt>Subtotal</dt>
              <dd>${order.subtotal.toFixed(2)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <dt>
                  Discount
                  {order.promoCode ? ` (${order.promoCode})` : ''}
                </dt>
                <dd>-${order.discountAmount.toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between text-text-muted">
              <dt>
                {order.fulfillmentMethod === 'SELF_COLLECTION'
                  ? 'Self collection'
                  : 'Shipping'}
              </dt>
              <dd>
                {order.shippingFee === 0
                  ? 'Free'
                  : `$${order.shippingFee.toFixed(2)}`}
              </dd>
            </div>
            {GST_ENABLED && (
              <div className="flex justify-between text-text-muted">
                <dt>GST</dt>
                <dd>${order.gstAmount.toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border-light pt-3 font-display text-xl font-semibold text-primary">
              <dt>Total</dt>
              <dd>${order.total.toFixed(2)}</dd>
            </div>
          </dl>
          <Link
            href="/account/orders"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-hover"
          >
            View my orders
          </Link>
        </aside>
      </div>
    </div>
  )
}
