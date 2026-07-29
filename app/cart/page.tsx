'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import CatalogImage from '../components/CatalogImage'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const totalItems = useCartStore((state) => state.getTotalItems())

  const [warnings, setWarnings] = useState<Record<string, string>>({})

  function handleQuantityChange(variantId: string, value: number, stock: number) {
    const nextValue = Math.max(1, value)

    if (nextValue > stock) {
      updateQuantity(variantId, Math.max(stock, 1))
      setWarnings((previous) => ({
        ...previous,
        [variantId]: `Only ${stock} available.`,
      }))
      return
    }

    updateQuantity(variantId, nextValue)
    setWarnings((previous) => ({ ...previous, [variantId]: '' }))
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border-light bg-surface text-primary shadow-card">
          <ShoppingBag className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-display text-3xl font-semibold tracking-[-0.03em] text-primary">
          Your binder is empty.
        </p>
        <p className="mt-2 max-w-sm text-text-muted">
          Explore the catalogue and add a set or format you love.
        </p>
        <Link
          href="/categories"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-text-inverse transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
        >
          Browse categories
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
      <Link
        href="/products"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Continue shopping
      </Link>

      <div className="mt-5">
        <p className="text-xs font-semibold tracking-[0.15em] text-accent uppercase">
          Your selection
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-semibold tracking-[-0.035em] text-primary md:text-5xl">
            Shopping cart
          </h1>
          <p className="pb-1 text-sm text-text-muted" aria-live="polite">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          className="overflow-hidden rounded-2xl border border-border-light bg-surface shadow-card"
          aria-labelledby="cart-items-heading"
        >
          <h2 id="cart-items-heading" className="sr-only">Cart items</h2>
          <div className="divide-y divide-border-light">
            {items.map((item) => (
              <article
                key={item.variantId}
                className="grid gap-4 p-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5"
              >
                <Link
                  href={`/product/${item.productSlug}`}
                  className="relative aspect-square w-full max-w-28 overflow-hidden rounded-lg border border-border-light bg-surface-muted"
                  aria-label={`View ${item.productName}`}
                >
                  {item.imageUrl ? (
                    <CatalogImage
                      src={item.imageUrl}
                      alt=""
                      sizes="112px"
                      className="p-2"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <ImageOff className="h-5 w-5 text-text-light" aria-hidden="true" />
                    </span>
                  )}
                </Link>

                <div className="min-w-0">
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="font-display text-lg font-semibold text-text transition-colors hover:text-primary"
                  >
                    {item.productName}
                  </Link>
                  {Object.keys(item.combination).length > 0 && (
                    <p className="mt-1 text-sm text-text-muted">
                      {Object.entries(item.combination)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-text-muted">
                    ${item.price.toFixed(2)} each
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div
                    className="flex min-h-11 items-center overflow-hidden rounded-md border border-border bg-background"
                    aria-label={`Quantity for ${item.productName}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          item.variantId,
                          item.quantity - 1,
                          item.stock
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="flex h-11 w-10 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`Decrease ${item.productName} quantity`}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
                      Quantity for {item.productName}
                    </label>
                    <input
                      id={`qty-${item.variantId}`}
                      type="number"
                      min={1}
                      max={Math.max(item.stock, 1)}
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(
                          item.variantId,
                          Number.parseInt(event.target.value, 10) || 1,
                          item.stock
                        )
                      }
                      className="h-11 w-12 border-x border-border bg-transparent text-center text-sm font-semibold text-text focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          item.variantId,
                          item.quantity + 1,
                          item.stock
                        )
                      }
                      disabled={item.quantity >= item.stock}
                      className="flex h-11 w-10 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label={`Increase ${item.productName} quantity`}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    aria-label={`Remove ${item.productName} from cart`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-text-muted transition-colors hover:bg-surface-muted hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>

                <div className="sm:col-start-2 sm:col-span-2" aria-live="polite">
                  {warnings[item.variantId] && (
                    <p className="text-sm text-warning">{warnings[item.variantId]}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-6 shadow-card lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-semibold text-primary">
            Order summary
          </h2>
          <div className="mt-5 flex items-center justify-between border-b border-border-light pb-5">
            <span className="text-sm text-text-muted">Subtotal</span>
            <span className="font-display text-2xl font-semibold text-primary">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-text-muted">
            Delivery, self-collection, discounts, and GST—when applicable—are
            confirmed at checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-text-inverse transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
          >
            Continue to checkout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-light">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Final stock and price are verified before payment.
          </p>
        </aside>
      </div>
    </div>
  )
}
