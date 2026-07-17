'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type ProductField = {
  id: string
  label: string
  key: string
  type: string
  required: boolean
  options: string[] | null
}

type ProductType = {
  id: string
  name: string
  fields: ProductField[]
}

type VariantOption = { name: string; values: string }
type VariantRow = {
  id?: string
  combination: Record<string, string>
  price: string
  stock: string
  sku: string
  imageUrl: string
}

function generateCombinations(options: VariantOption[]): VariantRow[] {
  const parsed = options
    .filter((o) => o.name && o.values)
    .map((o) => ({
      name: o.name,
      values: o.values.split(',').map((v) => v.trim()).filter(Boolean),
    }))

  if (parsed.length === 0) return []

  const combos = parsed.reduce<Record<string, string>[]>((acc, option) => {
    if (acc.length === 0) return option.values.map((v) => ({ [option.name]: v }))
    return acc.flatMap((combo) =>
      option.values.map((v) => ({ ...combo, [option.name]: v }))
    )
  }, [])

  return combos.map((combination) => ({
    combination,
    price: '',
    stock: '',
    sku: '',
    imageUrl: '',
  }))
}

function comboKey(combo: Record<string, string>) {
  return Object.entries(combo)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('|')
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params.id

  const [productType, setProductType] = useState<ProductType | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [attributes, setAttributes] = useState<Record<string, any>>({})

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/products/${productId}`)
        if (!res.ok) throw new Error('Product not found')
        const product = await res.json()

        setProductType(product.productType)
        setName(product.name)
        setDescription(product.description || '')
        setImageUrl(product.imageUrl || '')
        setAttributes(product.attributes || {})

        const optionsArray: VariantOption[] = Object.entries(
          product.variantOptions || {}
        ).map(([optName, values]) => ({
          name: optName,
          values: (values as string[]).join(', '),
        }))
        setVariantOptions(optionsArray)

        const variantRows: VariantRow[] = product.variants.map((v: any) => ({
          id: v.id,
          combination: v.combination,
          price: v.price.toString(),
          stock: v.stock.toString(),
          sku: v.sku || '',
          imageUrl: v.imageUrl || '',
        }))
        setVariants(variantRows)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [productId])

  function handleAttributeChange(key: string, value: any) {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }

  function renderField(field: ProductField) {
    const value = attributes[field.key] ?? ''

    switch (field.type) {
      case 'TEXT':
      case 'RICH_TEXT':
      case 'NUMBER':
      case 'CURRENCY':
        return (
          <input
            type={field.type === 'NUMBER' || field.type === 'CURRENCY' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'BOOLEAN':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleAttributeChange(field.key, e.target.checked)}
            className="h-4 w-4"
          />
        )

      case 'DATE':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'DROPDOWN':
        return (
          <select
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'RADIO':
        return (
          <div className="space-y-1">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.key}
                  value={opt}
                  checked={value === opt}
                  onChange={() => handleAttributeChange(field.key, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        )

      case 'COLOR':
        return (
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className="h-10 w-20 border rounded cursor-pointer"
          />
        )

      case 'TAG':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            placeholder="Comma separated tags"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  function addVariantOption() {
    setVariantOptions((prev) => [...prev, { name: '', values: '' }])
  }

  function updateVariantOption(index: number, field: 'name' | 'values', value: string) {
    setVariantOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    )
  }

  function removeVariantOption(index: number) {
    setVariantOptions((prev) => prev.filter((_, i) => i !== index))
  }

  // Merges newly-configured combinations into the existing table rather than
  // replacing it — an edit page must never silently wipe out price/stock
  // edits already made to existing variants.
  function handleGenerateCombinations() {
    const generated = generateCombinations(variantOptions)
    const existingKeys = new Set(variants.map((v) => comboKey(v.combination)))
    const newRows = generated.filter((g) => !existingKeys.has(comboKey(g.combination)))
    setVariants((prev) => [...prev, ...newRows])
  }

  function updateVariantRow(index: number, field: 'price' | 'stock' | 'sku' | 'imageUrl', value: string) {
    setVariants((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (variants.length === 0) {
      setError('At least one variant is required.')
      return
    }
    if (variants.some((v) => v.price === '' || v.stock === '')) {
      setError('Every variant needs a price and stock value.')
      return
    }

    setLoading(true)

    try {
      const variantOptionsJson = variantOptions.reduce<Record<string, string[]>>((acc, opt) => {
        if (opt.name && opt.values) {
          acc[opt.name] = opt.values.split(',').map((v) => v.trim()).filter(Boolean)
        }
        return acc
      }, {})

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
          attributes,
          variantOptions: variantOptionsJson,
          variants,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/products')
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-2">
          <h2 className="font-semibold text-gray-700">Product Type</h2>
          <p className="text-sm text-gray-600">{productType?.name}</p>
          <p className="text-xs text-gray-400">
            Product type cannot be changed after creation. Create a new product to use a different type.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Nike Air Force 1"
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
              rows={3}
              placeholder="Optional product description"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {productType && productType.fields.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="font-semibold text-gray-700">
              {productType.name} Details
            </h2>
            {productType.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Variants</h2>
            <button
              type="button"
              onClick={addVariantOption}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Option
            </button>
          </div>

          {variantOptions.map((opt, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => updateVariantOption(i, 'name', e.target.value)}
                placeholder="Option name (e.g. Size)"
                className="w-1/3 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={opt.values}
                onChange={(e) => updateVariantOption(i, 'values', e.target.value)}
                placeholder="Comma separated values (e.g. 7, 8, 9)"
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeVariantOption(i)}
                className="text-sm text-red-500 hover:text-red-700 px-2 py-2"
              >
                Remove
              </button>
            </div>
          ))}

          {variantOptions.length > 0 && (
            <button
              type="button"
              onClick={handleGenerateCombinations}
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900"
            >
              Add New Combinations
            </button>
          )}

          {variants.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Combination</th>
                    <th className="py-2 pr-4">Price (SGD)</th>
                    <th className="py-2 pr-4">Stock</th>
                    <th className="py-2 pr-4">SKU (optional)</th>
                    <th className="py-2 pr-4">Image URL (optional)</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((row, i) => (
                    <tr key={row.id ?? `new-${i}`} className="border-b last:border-b-0">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {Object.entries(row.combination)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                          required
                          className="w-24 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          min="0"
                          value={row.stock}
                          onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                          required
                          className="w-20 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="text"
                          value={row.sku}
                          onChange={(e) => updateVariantRow(i, 'sku', e.target.value)}
                          className="w-32 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="text"
                          value={row.imageUrl}
                          onChange={(e) => updateVariantRow(i, 'imageUrl', e.target.value)}
                          className="w-40 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <button
                          type="button"
                          onClick={() => removeVariantRow(i)}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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