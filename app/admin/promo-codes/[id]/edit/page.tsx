'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Ticket } from 'lucide-react'
import Button from '../../../../components/ui/Button'

const inputClass =
  'min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent'

export default function EditPromoCodePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
  const [active, setActive] = useState(true)
  const [usedAt, setUsedAt] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/promo-codes/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCode(data.code)
        setDiscountType(data.discountType)
        setDiscountValue(String(data.discountValue))
        setMinOrderValue(data.minOrderValue != null ? String(data.minOrderValue) : '')
        setMaxDiscountAmount(data.maxDiscountAmount != null ? String(data.maxDiscountAmount) : '')
        setActive(data.active)
        setUsedAt(data.usedAt)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load promo code.')
        setLoading(false)
      })
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/promo-codes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountValue,
          minOrderValue: minOrderValue || null,
          maxDiscountAmount: maxDiscountAmount || null,
          active,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update promo code.')
        setSubmitting(false)
        return
      }

      router.push('/admin/promo-codes')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-text-muted">Loading...</p>

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <Ticket className="h-6 w-6 text-accent" aria-hidden="true" />
        Edit Promo Code
      </h1>

      {usedAt && (
        <div className="mb-4 rounded-md bg-surface-muted px-4 py-3 text-sm text-text-muted">
          This code was already redeemed on {new Date(usedAt).toLocaleDateString()} and can never be used
          again, regardless of any changes made here.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-text">
            Code
          </label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClass} font-mono uppercase`}
            required
          />
        </div>

        <div>
          <label htmlFor="discountType" className="mb-1.5 block text-sm font-medium text-text">
            Discount Type
          </label>
          <select
            id="discountType"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT')}
            className={inputClass}
          >
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED_AMOUNT">Fixed amount off</option>
          </select>
        </div>

        <div>
          <label htmlFor="discountValue" className="mb-1.5 block text-sm font-medium text-text">
            Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '($)'}
          </label>
          <input
            id="discountValue"
            type="number"
            step="0.01"
            min="0"
            max={discountType === 'PERCENTAGE' ? 100 : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="minOrderValue" className="mb-1.5 block text-sm font-medium text-text">
            Minimum Order Value ($, optional)
          </label>
          <input
            id="minOrderValue"
            type="number"
            step="0.01"
            min="0"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            placeholder="No minimum"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="maxDiscountAmount" className="mb-1.5 block text-sm font-medium text-text">
            Maximum Discount Amount ($, optional)
          </label>
          <input
            id="maxDiscountAmount"
            type="number"
            step="0.01"
            min="0"
            value={maxDiscountAmount}
            onChange={(e) => setMaxDiscountAmount(e.target.value)}
            placeholder="No cap"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={!!usedAt}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
          Active
        </label>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}