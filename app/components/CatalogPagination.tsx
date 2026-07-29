import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

type CatalogPaginationProps = {
  basePath: string
  currentPage: number
  totalPages: number
  filters: Record<string, string | undefined>
}

export default function CatalogPagination({
  basePath,
  currentPage,
  totalPages,
  filters,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      className="mt-10 flex items-center justify-between border-t border-border-light pt-6"
      aria-label="Product pages"
    >
      <PaginationLink
        href={buildPageHref(basePath, currentPage - 1, filters)}
        disabled={currentPage === 1}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </PaginationLink>

      <p className="text-sm text-text-muted">
        Page <span className="font-semibold text-primary">{currentPage}</span> of {totalPages}
      </p>

      <PaginationLink
        href={buildPageHref(basePath, currentPage + 1, filters)}
        disabled={currentPage === totalPages}
      >
        Next
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </PaginationLink>
    </nav>
  )
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) {
  const className =
    'inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold transition-colors'

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed text-text-light opacity-55`} aria-disabled="true">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className={`${className} text-primary hover:border-accent hover:bg-surface-hover`}
    >
      {children}
    </Link>
  )
}

function buildPageHref(
  basePath: string,
  page: number,
  filters: Record<string, string | undefined>
) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value) search.set(key, value)
  }

  if (page > 1) search.set('page', page.toString())

  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}
