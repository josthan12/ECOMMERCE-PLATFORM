import { auth } from '@clerk/nextjs/server'
import { MapPin, PackageCheck, Truck } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import BackButton from '@/app/components/BackButton'
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants'
import { GST_ENABLED } from '@/lib/gst'
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus'
import { prisma } from '@/lib/prisma'

function formatCombination(combination: unknown): string {
  if (!combination || typeof combination !== 'object' || Array.isArray(combination)) {
    return '—'
  }

  return Object.entries(combination as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in?redirect_url=/account/orders')
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    redirect('/sign-in?redirect_url=/account/orders')
  }

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  // Return the same response for a missing order and an order owned by someone
  // else, so the route never reveals whether another customer's order exists.
  if (!order || order.userId !== user.id) {
    notFound()
  }

  const isCollection = order.fulfillmentMethod === 'SELF_COLLECTION'
  const FulfilmentIcon = isCollection ? MapPin : Truck

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
      <BackButton />

      <header className="mt-4 flex flex-col gap-4 border-b border-border-light pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            Order receipt
          </p>
          <h1 className="mt-3 break-all font-display text-2xl font-semibold tracking-[-0.02em] text-primary md:text-3xl">
            Order {order.id}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Placed{' '}
            {order.createdAt.toLocaleString('en-SG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-pill px-3 py-1.5 text-sm font-semibold ${
            STATUS_STYLES[order.status] ?? 'bg-surface-muted text-text'
          }`}
        >
          {formatStatus(order.status)}
        </span>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border-light bg-surface p-5 shadow-input">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-primary">
                <FulfilmentIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-text-muted uppercase">
                  Fulfilment
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-primary">
                  {isCollection ? 'Self-collection' : 'Shipping address'}
                </h2>
              </div>
            </div>

            <div className="mt-4 text-sm leading-6 text-text-muted">
              {isCollection ? (
                <p>Pickup location: {SELF_COLLECTION_ADDRESS}</p>
              ) : (
                <address className="not-italic">
                  <p>
                    Block {order.shippingBlock}
                    {order.shippingUnitNumber ? `, ${order.shippingUnitNumber}` : ''}
                  </p>
                  <p>{order.shippingStreet}</p>
                  <p>Singapore {order.shippingPostalCode}</p>
                </address>
              )}
            </div>
          </section>

          {order.trackingNumber && (
            <section className="rounded-xl border border-border-light bg-surface p-5 shadow-input">
              <div className="flex items-center gap-3">
                <PackageCheck className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold text-primary">
                  Tracking number
                </h2>
              </div>
              <p className="mt-3 break-all font-mono text-sm text-text">
                {order.trackingNumber}
              </p>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-border-light bg-surface shadow-input">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <caption className="sr-only">Items in this order</caption>
                <thead className="border-b border-border-light bg-surface-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-text-muted">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold text-text-muted">
                      Variant
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-text-muted">
                      Qty
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold text-text-muted">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-border-light last:border-0">
                      <th scope="row" className="px-4 py-3 text-left font-medium text-text">
                        {item.productName}
                      </th>
                      <td className="px-4 py-3 text-text-muted">
                        {formatCombination(item.combination)}
                      </td>
                      <td className="px-4 py-3 text-right text-text">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-text">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border-light bg-surface p-5 shadow-card lg:sticky lg:top-36">
          <h2 className="font-display text-xl font-semibold text-primary">
            Order total
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Subtotal</dt>
              <dd className="font-medium text-text">${order.subtotal.toFixed(2)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">
                  Discount{order.promoCode ? ` (${order.promoCode})` : ''}
                </dt>
                <dd className="font-medium text-success">
                  −${order.discountAmount.toFixed(2)}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">
                {isCollection ? 'Self-collection' : 'Shipping'}
              </dt>
              <dd className="font-medium text-text">${order.shippingFee.toFixed(2)}</dd>
            </div>
            {GST_ENABLED && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">GST</dt>
                <dd className="font-medium text-text">${order.gstAmount.toFixed(2)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-border-light pt-4 font-semibold">
              <dt className="text-primary">Total</dt>
              <dd className="font-display text-lg text-primary">${order.total.toFixed(2)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
