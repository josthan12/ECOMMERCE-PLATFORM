import { auth } from '@clerk/nextjs/server'
import { ChevronRight, PackageSearch, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus'

export default async function AccountOrdersPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect('/sign-in?redirect_url=/account/orders')
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    redirect('/sign-in?redirect_url=/account/orders')
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
        Your account
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-primary md:text-5xl">
        My orders
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
        Review your purchases, payment status, and fulfilment details.
      </p>

      {orders.length === 0 ? (
        <section className="mt-10 flex flex-col items-center rounded-2xl border border-border-light bg-surface p-10 text-center shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-text-light">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-xl font-semibold text-primary">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Your completed checkouts will appear here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-text-inverse transition-colors hover:bg-primary-hover"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <section className="mt-10" aria-labelledby="order-history-heading">
          <h2 id="order-history-heading" className="sr-only">
            Order history
          </h2>
          <div className="grid gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group flex min-h-24 flex-col justify-between gap-4 rounded-xl border border-border-light bg-surface p-5 shadow-input transition-all hover:border-accent hover:shadow-card sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary sm:flex">
                    <PackageSearch className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-text">
                      Order {order.id.slice(0, 8)}…
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {order.createdAt.toLocaleDateString('en-SG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span
                    className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-semibold ${
                      STATUS_STYLES[order.status] ?? 'bg-surface-muted text-text'
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>
                  <span className="font-display text-base font-semibold text-primary">
                    ${order.total.toFixed(2)}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 text-text-light transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
