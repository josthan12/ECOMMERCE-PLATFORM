'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageOff, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const subtotal = useCartStore((state) => state.getSubtotal())

  const [warnings, setWarnings] = useState<Record<string, string>>({})

  function handleQuantityChange(variantId: string, value: number, stock: number) {
    if (value > stock) {
      updateQuantity(variantId, stock)
      setWarnings((prev) => ({ ...prev, [variantId]: `Only ${stock} available.` }))
    } else {
      updateQuantity(variantId, value || 1)
      setWarnings((prev) => ({ ...prev, [variantId]: '' }))
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="font-display text-2xl text-primary">Your binder is empty.</p>
        <p className="mt-2 text-text-muted">Add a few favorites to get started.</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-text-inverse transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-primary"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Your Cart</h1>

      <div className="mt-6 flex flex-col gap-5">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 border-b border-border-light pb-5"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageOff className="h-5 w-5 text-text-light" aria-hidden="true" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${item.productSlug}`}
                className="font-medium text-text transition-colors hover:text-primary"
              >
                {item.productName}
              </Link>
              <p className="mt-0.5 text-sm text-text-muted">
                {Object.entries(item.combination)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </p>
              <p className="mt-1 font-medium text-primary">${item.price.toFixed(2)}</p>
              {warnings[item.variantId] && (
                <p className="mt-1 text-sm text-warning">{warnings[item.variantId]}</p>
              )}
            </div>

            <label className="sr-only" htmlFor={`qty-${item.variantId}`}>
              Quantity for {item.productName}
            </label>
            <input
              id={`qty-${item.variantId}`}
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.variantId, parseInt(e.target.value, 10) || 0, item.stock)
              }
              className="min-h-[44px] w-16 rounded-md border border-border bg-surface px-2 text-center text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <button
              onClick={() => removeItem(item.variantId)}
              aria-label={`Remove ${item.productName} from cart`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-light transition-colors hover:bg-surface-muted hover:text-error"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border-light pt-6">
        <div>
          <span className="text-sm text-text-muted">Subtotal</span>
          <p className="font-display text-xl font-semibold text-primary">${subtotal.toFixed(2)}</p>
        </div>
        <Link
          href="/checkout"
          className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-text-inverse transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-primary"
        >
          Checkout
        </Link>
      </div>
    </div>
  )
}