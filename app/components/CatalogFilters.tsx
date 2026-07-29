import Link from 'next/link'
import { RotateCcw, Search } from 'lucide-react'
import { CATALOG_SORT_OPTIONS, type CatalogSort } from '@/lib/catalog'
import Button from './ui/Button'

type FilterCategory = {
  slug: string
  name: string
}

type CatalogFiltersProps = {
  action: string
  sort: CatalogSort
  inStock: boolean
  categories?: FilterCategory[]
  selectedCategory?: string
  search?: string
  searchLabel?: string
}

export default function CatalogFilters({
  action,
  sort,
  inStock,
  categories,
  selectedCategory,
  search,
  searchLabel = 'Search products',
}: CatalogFiltersProps) {
  return (
    <form
      method="GET"
      action={action}
      className="mt-7 flex flex-wrap items-end gap-4 rounded-xl border border-border-light bg-surface p-4 shadow-input"
    >
      {search !== undefined && (
        <div className="min-w-60 flex-[2_1_20rem]">
          <label htmlFor="catalog-search" className="mb-1.5 block text-xs font-semibold text-text-muted">
            {searchLabel}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-light"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Enter a name"
              className="min-h-11 w-full rounded-md border border-border bg-background pr-3 pl-10 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="min-w-52 flex-1 sm:flex-none">
          <label htmlFor="category" className="mb-1.5 block text-xs font-semibold text-text-muted">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={selectedCategory ?? ''}
            className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="min-w-52 flex-1 sm:flex-none">
        <label htmlFor="sort" className="mb-1.5 block text-xs font-semibold text-text-muted">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {CATALOG_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex min-h-11 items-center gap-2 rounded-md px-1 text-sm text-text-muted">
        <input
          type="checkbox"
          name="inStock"
          value="true"
          defaultChecked={inStock}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent"
        />
        In stock only
      </label>

      <div className="flex min-h-11 items-center gap-2">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        <Link
          href={action}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </Link>
      </div>
    </form>
  )
}
