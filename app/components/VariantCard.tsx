import Link from 'next/link'
import { ArrowUpRight, ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import CatalogImage from './CatalogImage'
import { Prisma } from '@/app/generated/prisma/client'

export interface VariantCardVariant {
  id: string
  price: number
  stock: number
  combination: Prisma.JsonValue
  imageUrl?: string | null
  product: {
    slug: string
    name: string
    imageUrl?: string | null
  }
}

interface VariantCardProps {
  variant: VariantCardVariant
  headingLevel?: 'h2' | 'h3'
}

export default function VariantCard({
  variant,
  headingLevel = 'h3',
}: VariantCardProps) {
  const outOfStock = variant.stock === 0
  const Heading = headingLevel

  const format = (variant.combination as { Format?: string })?.Format ?? ''
  const variantImage = variant.imageUrl ?? variant.product.imageUrl
  const formatQueryParam = encodeURIComponent(format)

  return (
    <Link
      href={`/product/${variant.product.slug}?format=${formatQueryParam}`}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-border-light bg-surface shadow-card',
        'transition-all duration-[250ms] ease-out',
        'hover:-translate-y-1 hover:border-accent hover:shadow-dropdown',
        outOfStock && 'opacity-70'
      )}
    >
      {outOfStock && (
        <span className="absolute right-3 top-3 z-10 rounded-pill bg-ink/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-on-ink uppercase backdrop-blur-sm">
          Out of Stock
        </span>
      )}

      <div className="relative aspect-square overflow-hidden border-b border-border-light bg-surface-muted">
        {variantImage ? (
          <CatalogImage
            src={variantImage}
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
        <Heading className="min-h-10 line-clamp-2 text-sm font-medium leading-5 text-text md:text-base">
          {variant.product.name} - {format}
        </Heading>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-display text-base font-semibold text-primary md:text-lg">
            ${variant.price.toFixed(2)}
          </p>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}