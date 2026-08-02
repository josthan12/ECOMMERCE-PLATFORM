'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Power, PowerOff, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'

export default function PromoCodeActions({
  promoId,
  active,
  used,
}: {
  promoId: string
  active: boolean
  used: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggleActive() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/${promoId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update promo code')
      }
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update promo code')
    } finally {
      setLoading(false)
    }
  }

  async function handleReactivate() {
    if (!window.confirm('Reactivate this promo code? It will become available for use again.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/${promoId}/reactivate`, { method: 'PATCH' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reactivate promo code')
      }
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reactivate promo code')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this promo code? This cannot be undone.')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/${promoId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete promo code')
      }
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete promo code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {used ? (
        <button
          onClick={handleReactivate}
          disabled={loading}
          className="flex items-center gap-1.5 text-primary transition-colors hover:text-accent disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reactivate
        </button>
      ) : (
        <button
          onClick={handleToggleActive}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 transition-colors disabled:opacity-50',
            active ? 'text-warning hover:text-warning/80' : 'text-success hover:text-success/80'
          )}
        >
          {active ? <PowerOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Power className="h-3.5 w-3.5" aria-hidden="true" />}
          {active ? 'Deactivate' : 'Activate'}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex items-center gap-1.5 text-error transition-colors hover:text-error/80 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete
      </button>
    </div>
  )
}
