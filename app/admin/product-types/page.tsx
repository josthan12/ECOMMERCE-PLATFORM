import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductTypesPage() {
  const productTypes = await prisma.productType.findMany({
    include: {
      _count: {
        select: { fields: true, products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Types</h1>
        <Link
          href="/admin/product-types/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + New Product Type
        </Link>
      </div>

      {productTypes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          No product types yet. Create your first one.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-gray-600">Name</th>
                <th className="text-left px-6 py-3 text-gray-600">Fields</th>
                <th className="text-left px-6 py-3 text-gray-600">Products</th>
                <th className="text-left px-6 py-3 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productTypes.map((type) => (
                <tr key={type.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{type.name}</td>
                  <td className="px-6 py-4 text-gray-500">{type._count.fields} fields</td>
                  <td className="px-6 py-4 text-gray-500">{type._count.products} products</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/product-types/${type.id}`}
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
