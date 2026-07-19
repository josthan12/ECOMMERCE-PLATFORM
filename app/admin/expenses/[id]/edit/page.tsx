'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const CATEGORY_SUGGESTIONS = ['Shipping', 'Packaging', 'Product Cost', 'Marketing', 'Other']

export default function EditExpensePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [incurredAt, setIncurredAt] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/expenses/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title)
        setCategory(data.category)
        setAmount(String(data.amount))
        setIncurredAt(new Date(data.incurredAt).toISOString().slice(0, 10))
        setNotes(data.notes || '')
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load expense.')
        setLoading(false)
      })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/expenses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, amount, incurredAt, notes }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update expense.')
        setSubmitting(false)
        return
      }

      router.push('/admin/expenses')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit Expense</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="category-suggestions"
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date incurred</label>
          <input
            type="date"
            value={incurredAt}
            onChange={(e) => setIncurredAt(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white py-2.5 rounded disabled:bg-gray-300"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}