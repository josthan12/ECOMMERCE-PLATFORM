'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, Tags, Plus, X, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import Button from '../../../../components/ui/Button'

const FIELD_TYPES = [
  'TEXT', 'RICH_TEXT', 'NUMBER', 'CURRENCY', 'BOOLEAN', 'DATE',
  'DROPDOWN', 'CHECKBOX', 'RADIO', 'IMAGE', 'VIDEO', 'JSON', 'TAG', 'COLOR',
]

type Field = {
  id?: string
  label: string
  key: string
  type: string
  required: boolean
  options: string
}

export default function EditProductTypePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const typeId = params.id

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<Field[]>([])

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/product-types/${typeId}`)
        if (!res.ok) throw new Error('Product type not found')
        const data = await res.json()

        setName(data.name)
        setDescription(data.description || '')
        setFields(
          data.fields.map((f: any) => ({
            id: f.id,
            label: f.label,
            key: f.key,
            type: f.type,
            required: f.required,
            options: Array.isArray(f.options) ? f.options.join(', ') : '',
          }))
        )
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [typeId])

  function addField() {
    setFields([...fields, { label: '', key: '', type: 'TEXT', required: false, options: '' }])
  }

  function updateField(index: number, updated: Partial<Field>) {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updated } : f)))
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index))
  }

  function generateKey(label: string) {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/product-types/${typeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, fields }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/product-types')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="max-w-2xl text-sm text-text-muted">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <Tags className="h-6 w-6 text-accent" aria-hidden="true" />
        Edit Product Type
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-1.5 rounded-md bg-error/10 px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Basic Info</h2>

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
              Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptop, Shoes, Book"
              required
              className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-primary">Custom Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1.5 rounded-md bg-surface-muted px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Field
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-text-light">No fields yet. Click &ldquo;Add Field&rdquo; to start.</p>
          )}

          {fields.map((field, index) => {
            const isLocked = !!field.id

            return (
              <div
                key={field.id ?? `new-${index}`}
                className={cn(
                  'space-y-3 rounded-md border p-4',
                  isLocked ? 'border-border-light bg-surface-muted/60' : 'border-border-light bg-surface-muted'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-text-muted">
                    Field {index + 1}
                    {isLocked && (
                      <span className="flex items-center gap-1 text-xs font-normal text-text-light">
                        <Lock className="h-3 w-3" aria-hidden="true" />
                        key/type locked — in use since creation
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="flex items-center gap-1 text-sm text-error transition-colors hover:text-error/80"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(
                          index,
                          isLocked
                            ? { label: e.target.value }
                            : { label: e.target.value, key: generateKey(e.target.value) }
                        )
                      }
                      placeholder="e.g. Brand"
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-text-muted">
                      Key {isLocked ? '(locked)' : '(auto-generated)'}
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => !isLocked && updateField(index, { key: e.target.value })}
                      disabled={isLocked}
                      placeholder="e.g. brand"
                      className="w-full rounded-md border border-border bg-surface-hover px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:text-text-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => !isLocked && updateField(index, { type: e.target.value })}
                      disabled={isLocked}
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-surface-hover disabled:text-text-light"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end pb-1.5">
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent"
                      />
                      Required
                    </label>
                  </div>
                </div>

                {(field.type === 'DROPDOWN' || field.type === 'RADIO' || field.type === 'CHECKBOX') && (
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Options (comma separated)</label>
                    <input
                      type="text"
                      value={field.options}
                      onChange={(e) => updateField(index, { options: e.target.value })}
                      placeholder="e.g. Red, Blue, Green"
                      className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}