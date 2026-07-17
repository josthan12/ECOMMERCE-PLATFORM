'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProductActions({
  productId,
  archived,
}: {
  productId: string
  archived: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const message = archived
      ? 'Unarchive this product? It will become visible and purchasable on the storefront again.'
      : 'Archive this product? It will be hidden from the storefront and search — order history is unaffected.'

    if (!window.confirm(message)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !archived }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update product')
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
      onClick={handleToggle}
      disabled={loading}
      className={
        archived
          ? 'text-green-600 hover:text-green-700 disabled:opacity-50'
          : 'text-red-500 hover:text-red-700 disabled:opacity-50'
      }
    >
      {loading ? 'Saving...' : archived ? 'Unarchive' : 'Archive'}
    </button>
  )
}