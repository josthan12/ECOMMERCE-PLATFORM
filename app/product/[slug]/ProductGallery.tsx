'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ImageOff,
  Minus,
  Plus,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/cn'
import Button from '../../components/ui/Button'
import CatalogImage from '../../components/CatalogImage'
import PurchaseNotice from '@/lib/ProductNotice'

type Variant = {
  id: string
  combination: unknown
  description: string | null
  price: number
  stock: number
  sku: string | null
  imageUrl: string | null
}

type Props = {
  productId: string
  productName: string
  productSlug: string
  description: string | null
  attributes: Record<string, unknown>
  variantOptions: Record<string, string[]>
  variants: Variant[]
  fallbackImageUrl: string | null
  category?: {
    name: string
    slug: string
  }
}

type NormalizedVariant = Omit<Variant, 'combination'> & {
  combination: Record<string, string>
}

function normalizeCombination(value: unknown): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, optionValue]) => [
        key,
        optionValue == null ? '' : String(optionValue),
      ])
    )
  }
  return {}
}

function initialSelection(
  variantOptions: Record<string, string[]>,
  variants: Variant[]
) {
  const optionKeys = Object.keys(variantOptions)
  const preferredVariant =
    variants.find((variant) => variant.stock > 0) ?? variants[0]
  const preferredCombination = normalizeCombination(preferredVariant?.combination)

  return Object.fromEntries(
    optionKeys.map((key) => [
      key,
      preferredCombination[key] ?? variantOptions[key][0] ?? '',
    ])
  )
}

export default function ProductGallery({
  productId,
  productName,
  productSlug,
  description,
  attributes,
  variantOptions,
  variants,
  fallbackImageUrl,
  category,
}: Props) {
  const optionKeys = useMemo(() => Object.keys(variantOptions), [variantOptions])
  const attributeEntries = Object.entries(attributes)
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    initialSelection(variantOptions, variants)
  )
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [quantityWarning, setQuantityWarning] = useState<string | null>(null)

  const normalizedVariants = useMemo<NormalizedVariant[]>(
    () =>
      variants.map((variant) => ({
        ...variant,
        combination: normalizeCombination(variant.combination),
      })),
    [variants]
  )

  const matchedVariant = useMemo(() => {
    return normalizedVariants.find((variant) =>
      optionKeys.every((key) => {
        const variantValue = variant.combination[key]
        const selectedValue = selected[key]
        return variantValue != null && selectedValue != null && variantValue === selectedValue
      })
    )
  }, [selected, normalizedVariants, optionKeys])

  const galleryImages = useMemo(() => {
    const seen = new Set<string>()
    const images: {
      url: string
      label: string
      combination?: Record<string, string>
    }[] = []

    if (fallbackImageUrl) {
      seen.add(fallbackImageUrl)
      images.push({ url: fallbackImageUrl, label: `${productName} main image` })
    }

    for (const variant of normalizedVariants) {
      if (!variant.imageUrl || seen.has(variant.imageUrl)) continue
      seen.add(variant.imageUrl)
      const formatName = Object.values(variant.combination).join(' · ')
      images.push({
        url: variant.imageUrl,
        label: formatName ? `${productName} — ${formatName}` : productName,
        combination: variant.combination,
      })
    }

    return images
  }, [fallbackImageUrl, normalizedVariants, productName])

  const alreadyInCart = useMemo(() => {
    if (!matchedVariant) return 0
    const existing = cartItems.find((item) => item.variantId === matchedVariant.id)
    return existing?.quantity ?? 0
  }, [cartItems, matchedVariant])

  const remaining = matchedVariant
    ? Math.max(matchedVariant.stock - alreadyInCart, 0)
    : 0
  const displayImageUrl =
    activeImageUrl ?? matchedVariant?.imageUrl ?? fallbackImageUrl

  function matchingVariantForOption(key: string, value: string) {
    return normalizedVariants.find((variant) =>
      optionKeys.every((optionKey) => {
        const expectedValue = optionKey === key ? value : selected[optionKey]
        return variant.combination[optionKey] === expectedValue
      })
    )
  }

  function resetPurchaseFeedback() {
    setJustAdded(false)
    setQuantityWarning(null)
    setQuantity(1)
  }

  function handleSelect(key: string, value: string) {
    setSelected((previous) => ({ ...previous, [key]: value }))
    setActiveImageUrl(null)
    resetPurchaseFeedback()
  }

  function handleQuantityChange(value: number) {
    setJustAdded(false)
    const nextQuantity = Math.max(1, value)

    if (nextQuantity > remaining) {
      setQuantity(Math.max(remaining, 1))
      setQuantityWarning(
        alreadyInCart > 0
          ? `Only ${remaining} more available; ${alreadyInCart} already in your cart.`
          : `Only ${remaining} available.`
      )
      return
    }

    setQuantity(nextQuantity)
    setQuantityWarning(null)
  }

  function handleGalleryImage(
    imageUrl: string,
    combination?: Record<string, string>
  ) {
    setActiveImageUrl(imageUrl)
    if (combination) {
      setSelected((previous) => ({ ...previous, ...combination }))
      resetPurchaseFeedback()
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

  return (
    <div>
      <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border border-border-light bg-surface-muted shadow-card">
            {displayImageUrl ? (
              <CatalogImage
                src={displayImageUrl}
                alt={productName}
                sizes="(max-width: 1023px) calc(100vw - 2rem), 700px"
                className="p-4 sm:p-7"
                eager
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-9 w-9 text-text-light" aria-hidden="true" />
                <span className="sr-only">No product image available</span>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label="Product images">
              {galleryImages.map((image) => {
                const isActive = displayImageUrl === image.url
                return (
                  <button
                    key={image.url}
                    type="button"
                    aria-label={`View ${image.label}`}
                    aria-pressed={isActive}
                    onClick={() => handleGalleryImage(image.url, image.combination)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-lg border bg-surface-muted transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                      isActive
                        ? 'border-accent shadow-input'
                        : 'border-border-light hover:border-border-strong'
                    )}
                  >
                    <CatalogImage
                      src={image.url}
                      alt=""
                      sizes="120px"
                      className="p-1.5"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.14em] text-accent uppercase transition-colors hover:text-primary"
            >
              {category.name}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}

          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] text-primary md:text-5xl">
            {productName}
          </h1>

          {description && (
            <p className="mt-5 text-base leading-7 text-text-muted">
              {description}
            </p>
          )}

          <section
            className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7"
            aria-labelledby="purchase-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-light pb-5">
              <div>
                <h2 id="purchase-heading" className="text-sm font-semibold text-text">
                  Choose your format
                </h2>
                <p className="mt-1 text-xs text-text-muted">
                  Price and availability update with your selection.
                </p>
              </div>

              {matchedVariant && (
                <div className="text-right">
                  <p className="font-display text-3xl font-semibold text-primary">
                    ${matchedVariant.price.toFixed(2)}
                  </p>
                  {matchedVariant.sku && (
                    <p className="mt-1 text-xs text-text-light">SKU: {matchedVariant.sku}</p>
                  )}
                </div>
              )}
            </div>

            {optionKeys.map((key) => (
              <fieldset key={key} className="mt-6">
                <legend className="mb-2.5 text-sm font-medium text-text">{key}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {variantOptions[key].map((value) => {
                    const optionVariant = matchingVariantForOption(key, value)
                    const isSelected = selected[key] === value
                    const isUnavailable = !optionVariant || optionVariant.stock <= 0

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelect(key, value)}
                        className={cn(
                          'min-h-16 rounded-lg border px-3 py-2.5 text-left transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                          isSelected
                            ? 'border-accent bg-accent text-accent-foreground shadow-input'
                            : 'border-border bg-background text-text hover:border-border-strong hover:bg-surface-hover',
                          isUnavailable && !isSelected && 'text-text-muted'
                        )}
                      >
                        <span className="block text-sm font-semibold">{value}</span>
                        <span
                          className={cn(
                            'mt-1 block text-xs',
                            isSelected
                              ? 'text-accent-foreground'
                              : 'text-text-muted'
                          )}
                        >
                          {optionVariant
                            ? optionVariant.stock > 0
                              ? `$${optionVariant.price.toFixed(2)}`
                              : 'Sold out'
                            : 'Unavailable'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-6 border-t border-border-light pt-5">
              {matchedVariant ? (
                <>
                  <div className="flex items-center gap-1.5 text-sm">
                    {matchedVariant.stock > 0 ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        <span className="text-success">
                          {matchedVariant.stock} in stock
                          {alreadyInCart > 0 ? ` · ${alreadyInCart} in your cart` : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-text-light" aria-hidden="true" />
                        <span className="text-text-muted">This format is sold out</span>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <div
                      className="flex min-h-12 items-center justify-between rounded-md border border-border bg-background"
                      aria-label="Quantity"
                    >
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || remaining <= 0}
                        className="flex h-12 w-11 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(remaining, 1)}
                        value={quantity}
                        onChange={(event) =>
                          handleQuantityChange(Number.parseInt(event.target.value, 10) || 1)
                        }
                        className="h-12 w-12 border-x border-border bg-transparent text-center text-sm font-semibold text-text focus:outline-none"
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= remaining || remaining <= 0}
                        className="flex h-12 w-11 items-center justify-center text-text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={remaining <= 0}
                      className="flex-1 gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      {matchedVariant.stock <= 0
                        ? 'Sold out'
                        : remaining <= 0
                          ? 'Maximum in cart'
                          : 'Add to cart'}
                    </Button>
                  </div>

                  <div aria-live="polite">
                    {quantityWarning && (
                      <p className="mt-3 text-sm text-warning">{quantityWarning}</p>
                    )}
                    {justAdded && (
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Added to cart.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-muted">
                  This combination is unavailable. Please choose another format.
                </p>
              )}
            </div>
          </section>

          {matchedVariant?.description && (
            <section
              className="mt-6 rounded-2xl border border-border-light bg-surface p-5 shadow-input sm:p-7"
              aria-labelledby="variant-description-heading"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                Selected format
              </p>
              <h2
                id="variant-description-heading"
                className="mt-2 font-display text-xl font-semibold text-primary"
              >
                Product contents
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-6 text-text-muted">
                {matchedVariant.description}
              </p>
            </section>
          )}
        </div>
      </div>

      {attributeEntries.length > 0 && (
        <section className="mt-14 border-t border-border-light pt-10" aria-labelledby="details-heading">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                Set information
              </p>
              <h2 id="details-heading" className="mt-2 font-display text-2xl font-semibold text-primary">
                Product details
              </h2>
            </div>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {attributeEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 border-b border-border-light py-3 text-sm"
                >
                  <dt className="text-text-muted">{key}</dt>
                  <dd className="text-right font-medium text-text">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <PurchaseNotice />
    </div>
  )
}
