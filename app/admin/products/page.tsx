import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No products yet. Create your first one.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600">Name</th>
                <th className="text-left px-6 py-3 text-gray-600">Type</th>
                <th className="text-left px-6 py-3 text-gray-600">Price (SGD)</th>
                <th className="text-left px-6 py-3 text-gray-600">Stock</th>
                <th className="text-left px-6 py-3 text-gray-600">Variants</th>
                <th className="text-left px-6 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500">{product.productType.name}</td>
                  <td className="px-6 py-4">{formatPrice(product.variants)}</td>
                  <td className="px-6 py-4">{totalStock(product.variants)}</td>
                  <td className="px-6 py-4 text-gray-500">{product.variants.length}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}