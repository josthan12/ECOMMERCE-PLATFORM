export const CATALOG_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
] as const

export type CatalogSort = (typeof CATALOG_SORT_OPTIONS)[number]['value']

type CatalogProduct = {
  name: string
  createdAt: Date
  variants: { price: number }[]
}

export function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parseCatalogSort(value: string | string[] | undefined): CatalogSort {
  const candidate = firstSearchParam(value)

  return CATALOG_SORT_OPTIONS.some((option) => option.value === candidate)
    ? (candidate as CatalogSort)
    : 'newest'
}

export function parsePositivePage(value: string | string[] | undefined) {
  const parsed = Number.parseInt(firstSearchParam(value) ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function minimumVariantPrice(variants: { price: number }[]) {
  if (variants.length === 0) return 0
  return Math.min(...variants.map((variant) => variant.price))
}

export function sortCatalogProducts<T extends CatalogProduct>(
  products: T[],
  sort: CatalogSort
) {
  const sorted = [...products]

  switch (sort) {
    case 'price-asc':
      return sorted.sort(
        (a, b) => minimumVariantPrice(a.variants) - minimumVariantPrice(b.variants)
      )
    case 'price-desc':
      return sorted.sort(
        (a, b) => minimumVariantPrice(b.variants) - minimumVariantPrice(a.variants)
      )
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'newest':
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
