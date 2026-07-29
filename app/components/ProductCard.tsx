import Link from 'next/link'
import { ArrowUpRight, ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import CatalogImage from './CatalogImage'

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
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border-light bg-surface shadow-card',
        'transition-all duration-[250ms] ease-out',
        'hover:-translate-y-1 hover:border-accent hover:shadow-dropdown'
      )}
    >
      {showOutOfStockBadge && outOfStock && (
        <span className="absolute right-3 top-3 z-10 rounded-pill bg-ink/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-on-ink uppercase backdrop-blur-sm">
          Out of Stock
        </span>
      )}

      <div className="relative aspect-square overflow-hidden border-b border-border-light bg-surface-muted">
        {product.imageUrl ? (
          <CatalogImage
            src={product.imageUrl}
            alt=""
            sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1399px) 25vw, 350px"
            className="p-3 transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-6 w-6 text-text-light" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-[0.1em] uppercase">
          <span className={outOfStock ? 'text-text-muted' : 'text-success'}>
            {outOfStock ? 'Unavailable' : 'In stock'}
          </span>
          <span className="text-text-light">
            {product.variants.length}{' '}
            {product.variants.length === 1 ? 'format' : 'formats'}
          </span>
        </div>
        <Heading className="mt-3 min-h-10 line-clamp-2 text-sm font-medium leading-5 text-text md:text-base">
          {product.name}
        </Heading>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-display text-base font-semibold text-primary md:text-lg">
            {formatPrice(product.variants)}
          </p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
