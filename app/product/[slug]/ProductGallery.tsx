'use client'

import { useMemo, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'

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
      <div className="h-96 bg-gray-100 rounded-lg overflow-hidden mb-6">
        {displayImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      {optionKeys.map((key) => (
        <div key={key} className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">{key}</div>
          <div className="flex flex-wrap gap-2">
            {variantOptions[key].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(key, value)}
                className={`px-3 py-1.5 text-sm rounded border ${
                  selected[key] === value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 pt-6 border-t">
        {matchedVariant ? (
          <>
            <div className="text-2xl font-bold text-gray-800">
              ${matchedVariant.price.toFixed(2)}
            </div>
            <div className="mt-1 text-sm">
              {matchedVariant.stock > 0 ? (
                <span className="text-green-600">{matchedVariant.stock} in stock</span>
              ) : (
                <span className="text-gray-500">Out of stock</span>
              )}
            </div>
            {matchedVariant.sku && (
              <div className="mt-1 text-xs text-gray-400">SKU: {matchedVariant.sku}</div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={remaining}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 0)}
                className="w-16 border border-gray-300 px-2 py-1 rounded"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={remaining <= 0}
                className="px-4 py-2 bg-black text-white text-sm rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {remaining <= 0 ? 'Max in cart' : 'Add to Cart'}
              </button>
            </div>
            {quantityWarning && (
              <p className="mt-2 text-sm text-amber-600">{quantityWarning}</p>
            )}
            {justAdded && (
              <p className="mt-2 text-sm text-green-600">Added to cart.</p>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">This combination is unavailable.</div>
        )}
      </div>
    </div>
  )
}