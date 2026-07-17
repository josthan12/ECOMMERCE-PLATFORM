'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CategoryActions({
  categoryId,
  productCount,
}: {
  categoryId: string
  productCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const message =
      productCount > 0
        ? `Delete this category? ${productCount} product${productCount === 1 ? '' : 's'} will be unassigned from it (the products themselves are not deleted).`
        : 'Delete this category?'

    if (!window.confirm(message)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete category')
      }
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}