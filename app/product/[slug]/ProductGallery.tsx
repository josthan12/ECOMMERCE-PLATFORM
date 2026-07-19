'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, ShoppingBag, Check } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/cn'
import Button from '../../components/ui/Button'

type Variant = {
  id: string
  combination: unknown
  price: number
  stock: number
  sku: string | null
  imageUrl: string | null
}

type Props = {
  productId: string
  productName: string
  productSlug: string
  variantOptions: Record<string, string[]>
  variants: Variant[]
  fallbackImageUrl: string | null
}

function normalizeCombination(value: unknown): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, v == null ? '' : String(v)])
    )
  }
  return {}
}

export default function ProductGallery({
  productId,
  productName,
  productSlug,
  variantOptions,
  variants,
  fallbackImageUrl,
}: Props) {
  const optionKeys = Object.keys(variantOptions)
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const key of optionKeys) {
      initial[key] = variantOptions[key][0]
    }
    return initial
  })

  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [quantityWarning, setQuantityWarning] = useState<string | null>(null)

  const normalizedVariants = useMemo(
    () =>
      variants.map((v) => ({
        ...v,
        combination: normalizeCombination(v.combination),
      })),
    [variants]
  )

  const matchedVariant = useMemo(() => {
    return normalizedVariants.find((v) =>
      optionKeys.every((key) => {
        const a = v.combination[key]
        const b = selected[key]
        return a != null && b != null && a === b
      })
    )
  }, [selected, normalizedVariants, optionKeys])

  const alreadyInCart = useMemo(() => {
    if (!matchedVariant) return 0
    const existing = cartItems.find((i) => i.variantId === matchedVariant.id)
    return existing?.quantity ?? 0
  }, [cartItems, matchedVariant])

  const remaining = matchedVariant ? Math.max(matchedVariant.stock - alreadyInCart, 0) : 0

  function handleSelect(key: string, value: string) {
    setSelected((prev) => ({ ...prev, [key]: value }))
    setJustAdded(false)
    setQuantityWarning(null)
  }

  function handleQuantityChange(value: number) {
    setJustAdded(false)
    if (value > remaining) {
      setQuantity(remaining)
      setQuantityWarning(`Only ${remaining} more available (you already have ${alreadyInCart} in your cart).`)
    } else {
      setQuantity(value || 1)
      setQuantityWarning(null)
    }
  }

  function handleAddToCart() {
    if (!matchedVariant || remaining <= 0) return
    addItem(
      {
        variantId: matchedVariant.id,
        productId,
        productName,
        productSlug,
        combination: matchedVariant.combination,
        price: matchedVariant.price,
        stock: matchedVariant.stock,
        imageUrl: matchedVariant.imageUrl || fallbackImageUrl,
      },
      quantity
    )
    setJustAdded(true)
    setQuantity(1)
    setQuantityWarning(null)
  }

  const displayImageUrl = matchedVariant?.imageUrl || fallbackImageUrl

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-border-light bg-surface-muted">
        {displayImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayImageUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      {optionKeys.map((key) => (
        <div key={key} className="mt-6">
          <div className="mb-2 text-sm font-medium text-text">{key}</div>
          <div className="flex flex-wrap gap-2">
            {variantOptions[key].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(key, value)}
                className={cn(
                  'rounded-md border px-3.5 py-2 text-sm font-medium transition-colors duration-150 ease-out',
                  selected[key] === value
                    ? 'border-accent bg-accent-light text-primary'
                    : 'border-border text-text-muted hover:border-border-strong hover:text-text'
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 border-t border-border-light pt-6">
        {matchedVariant ? (
          <>
            <div className="font-display text-3xl font-semibold text-primary">
              ${matchedVariant.price.toFixed(2)}
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-sm">
              {matchedVariant.stock > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                  <span className="text-success">{matchedVariant.stock} in stock</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-text-light" aria-hidden="true" />
                  <span className="text-text-muted">Out of stock</span>
                </>
              )}
            </div>

            {matchedVariant.sku && (
              <div className="mt-1 text-xs text-text-light">SKU: {matchedVariant.sku}</div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={remaining}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 0)}
                className="min-h-[44px] w-16 rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button type="button" onClick={handleAddToCart} disabled={remaining <= 0} className="gap-2">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {remaining <= 0 ? 'Max in cart' : 'Add to Cart'}
              </Button>
            </div>

            {quantityWarning && <p className="mt-3 text-sm text-warning">{quantityWarning}</p>}
            {justAdded && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
                <Check className="h-4 w-4" aria-hidden="true" />
                Added to cart.
              </p>
            )}
          </>
        ) : (
          <div className="text-sm text-text-muted">This combination is unavailable.</div>
        )}
      </div>
    </div>
  )
}