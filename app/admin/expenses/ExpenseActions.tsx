'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      className="text-red-600 hover:underline disabled:text-gray-400"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}