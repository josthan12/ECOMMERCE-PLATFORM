'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function ExpenseActions({ expenseId }: { expenseId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this expense? This cannot be undone.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/expenses/${expenseId}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Failed to delete expense.')
        setDeleting(false)
        return
      }
      router.refresh()
    } catch {
      alert('Network error. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center gap-1.5 text-error transition-colors hover:text-error/80 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}