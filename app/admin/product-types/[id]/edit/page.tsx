'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
    setFields([
      ...fields,
      { label: '', key: '', type: 'TEXT', required: false, options: '' },
    ])
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
    return <div className="max-w-2xl text-sm text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product Type</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptop, Shoes, Book"
              required
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Custom Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              + Add Field
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-gray-400">
              No fields yet. Click "Add Field" to start.
            </p>
          )}

          {fields.map((field, index) => {
            const isLocked = !!field.id

            return (
              <div key={field.id ?? `new-${index}`} className="border rounded p-4 space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Field {index + 1}
                    {isLocked && (
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        (key/type locked — in use since creation)
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        updateField(
                          index,
                          isLocked
                            ? { label: e.target.value }
                            : { label: e.target.value, key: generateKey(e.target.value) }
                        )
                      }}
                      placeholder="e.g. Brand"
                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Key {isLocked ? '(locked)' : '(auto-generated)'}
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => !isLocked && updateField(index, { key: e.target.value })}
                      disabled={isLocked}
                      placeholder="e.g. brand"
                      className="w-full border rounded px-2 py-1 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => !isLocked && updateField(index, { type: e.target.value })}
                      disabled={isLocked}
                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                      />
                      Required
                    </label>
                  </div>
                </div>

                {(field.type === 'DROPDOWN' ||
                  field.type === 'RADIO' ||
                  field.type === 'CHECKBOX') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Options (comma separated)
                    </label>
                    <input
                      type="text"
                      value={field.options}
                      onChange={(e) => updateField(index, { options: e.target.value })}
                      placeholder="e.g. Red, Blue, Green"
                      className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}