import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ProductCardVariant = { price: number; stock: number }

export interface ProductCardProduct {
  id: string
  slug: string
  name: string
  imageUrl?: string | null
  variants: ProductCardVariant[]
}

interface ProductCardProps {
  product: ProductCardProduct
  headingLevel?: 'h2' | 'h3'
  showOutOfStockBadge?: boolean
}

export function formatPrice(variants: ProductCardVariant[]) {
  if (variants.length === 0) return '—'
  const prices = variants.map((v) => v.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`
}

export function totalStock(variants: ProductCardVariant[]) {
  return variants.reduce((sum, v) => sum + v.stock, 0)
}

export default function ProductCard({
  product,
  headingLevel = 'h3',
  showOutOfStockBadge = true,
}: ProductCardProps) {
  const outOfStock = totalStock(product.variants) === 0
  const Heading = headingLevel

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group relative block overflow-hidden rounded-lg border border-border-light bg-surface shadow-card',
        'transition-all duration-250 ease-out',
        'hover:-translate-y-1.5 hover:border-accent hover:shadow-dropdown'
      )}
    >
      {showOutOfStockBadge && outOfStock && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-pill bg-primary/90 px-2.5 py-1 text-xs font-medium text-text-inverse">
          Out of Stock
        </span>
      )}

      <div className="aspect-[3/4] overflow-hidden bg-surface-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-6 w-6 text-text-light" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="p-4">
        <Heading className="line-clamp-2 text-sm font-medium text-text">
          {product.name}
        </Heading>
        <p className="mt-1.5 font-medium text-primary">{formatPrice(product.variants)}</p>
      </div>
    </Link>
  )
}