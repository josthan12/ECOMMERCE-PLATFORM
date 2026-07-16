import Link from 'next/link'

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
      className="bg-white rounded-lg shadow overflow-hidden relative block hover:shadow-md transition-shadow"
    >
      {showOutOfStockBadge && outOfStock && (
        <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          Out of Stock
        </span>
      )}
      <div className="h-40 bg-gray-100">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <Heading className="font-medium text-gray-800">{product.name}</Heading>
        <p className="mt-1 text-sm text-gray-600">{formatPrice(product.variants)}</p>
      </div>
    </Link>
  )
}