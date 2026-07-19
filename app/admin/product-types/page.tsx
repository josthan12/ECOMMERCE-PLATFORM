import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Tags, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Product Types</h1>
        <Link href="/admin/product-types/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Product Type
          </Button>
        </Link>
      </div>

      {productTypes.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <Tags className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No product types yet.</p>
          <p className="mt-1 text-sm text-text-muted">Create your first one to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Fields</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Products</th>
                  <th className="px-6 py-3 text-left font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productTypes.map((type, i) => (
                  <tr
                    key={type.id}
                    className={`border-b border-border-light transition-colors last:border-b-0 hover:bg-surface-hover ${
                      i % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-text">{type.name}</td>
                    <td className="px-6 py-4 text-text-muted">{type._count.fields} fields</td>
                    <td className="px-6 py-4 text-text-muted">{type._count.products} products</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/product-types/${type.id}/edit`}
                        className="text-primary transition-colors hover:text-accent"
                      >
                        Edit
                      </Link>
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