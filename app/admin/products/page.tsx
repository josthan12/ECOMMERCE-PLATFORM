import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import ProductActions from './ProductActions'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      productType: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  function formatPrice(variants: { price: number }[]) {
    if (variants.length === 0) return '—'
    const prices = variants.map((v) => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`
  }

  function totalStock(variants: { stock: number }[]) {
    return variants.reduce((sum, v) => sum + v.stock, 0)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Products</h1>
        <Link href="/admin/products/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <Package className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No products yet.</p>
          <p className="mt-1 text-sm text-text-muted">Create your first one to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Type</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Price (SGD)</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Stock</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Variants</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`border-b border-border-light transition-colors last:border-b-0 hover:bg-surface-hover ${
                      i % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-text">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {product.archived && <Badge variant="neutral">Archived</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{product.productType.name}</td>
                    <td className="px-6 py-4 text-text">{formatPrice(product.variants)}</td>
                    <td className="px-6 py-4 text-text">{totalStock(product.variants)}</td>
                    <td className="px-6 py-4 text-text-muted">{product.variants.length}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-primary transition-colors hover:text-accent"
                        >
                          Edit
                        </Link>
                        <ProductActions productId={product.id} archived={product.archived} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}