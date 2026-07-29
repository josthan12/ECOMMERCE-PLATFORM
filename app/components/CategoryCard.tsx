import Link from 'next/link'
import { ArrowUpRight, ImageOff } from 'lucide-react'
import CatalogImage from './CatalogImage'

type CategoryCardProps = {
  category: {
    slug: string
    name: string
    description?: string | null
    bannerImageUrl?: string | null
  }
  productCount: number
  imageSizes?: string
  headingLevel?: 'h2' | 'h3'
}

export default function CategoryCard({
  category,
  productCount,
  imageSizes = '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
  headingLevel = 'h2',
}: CategoryCardProps) {
  const Heading = headingLevel

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative block aspect-[4/3] h-full min-h-[280px] overflow-hidden rounded-xl border border-border-light bg-ink shadow-card transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:border-accent hover:shadow-dropdown"
    >
      <div className="absolute inset-0 overflow-hidden bg-ink-muted">
        {category.bannerImageUrl ? (
          <CatalogImage
            src={category.bannerImageUrl}
            alt=""
            sizes={imageSizes}
            fit="cover"
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-7 w-7 text-on-ink-muted" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-[#070d18]/95 via-[#070d18]/28 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-accent uppercase">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
            <Heading className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
              {category.name}
            </Heading>
            {category.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                {category.description}
              </p>
            )}
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}
