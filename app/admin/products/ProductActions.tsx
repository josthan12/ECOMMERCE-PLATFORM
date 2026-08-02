'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Archive, ArchiveRestore } from 'lucide-react'
import { cn } from '@/lib/cn'

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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 transition-colors disabled:opacity-50',
        archived ? 'text-success hover:text-success/80' : 'text-error hover:text-error/80'
      )}
    >
      {archived ? (
        <ArchiveRestore className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {loading ? 'Saving...' : archived ? 'Unarchive' : 'Archive'}
    </button>
  )
}
