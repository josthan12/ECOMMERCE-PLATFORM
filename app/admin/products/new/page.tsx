'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Package, Plus, X } from 'lucide-react'
import Button from '../../../components/ui/Button'
import {
  getCatalogImagePath,
  verifyCatalogImageFile,
} from '@/lib/catalogImages'

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
type ImageVerificationStatus = 'idle' | 'checking' | 'verified' | 'error'
type ProductAttributeValue = string | number | boolean
type VariantRow = {
  combination: Record<string, string>
  description: string
  price: string
  stock: string
  sku: string
  imageFilename: string
  imageStatus: ImageVerificationStatus
  imageMessage: string
}

// No width baked in here on purpose — combining a fixed width utility
// (w-1/3, flex-1) with a class that also sets width causes Tailwind to
// pick whichever wins in its generated CSS order, not the order written
// in JSX. Every full-width usage below adds `w-full` explicitly instead.
const inputClass =
  'rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent'
const cellInputClass =
  'rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent'

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
    return acc.flatMap((combo) => option.values.map((v) => ({ ...combo, [option.name]: v })))
  }, [])

  return combos.map((combination) => ({
    combination,
    description: '',
    price: '',
    stock: '',
    sku: '',
    imageFilename: '',
    imageStatus: 'idle',
    imageMessage: '',
  }))
}

export default function NewProductPage() {
  const router = useRouter()

  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [selectedTypeId, setSelectedTypeId] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [attributes, setAttributes] = useState<Record<string, ProductAttributeValue>>({})

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [imageFilename, setImageFilename] = useState('')
  const imageFilenameRef = useRef('')
  const [imageStatus, setImageStatus] = useState<ImageVerificationStatus>('idle')
  const [imageMessage, setImageMessage] = useState('')
  const [variants, setVariants] = useState<VariantRow[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/product-types')
      .then((res) => res.json())
      .then((data) => setProductTypes(data))
  }, [])

  const selectedType = productTypes.find((type) => type.id === selectedTypeId) ?? null

  function handleAttributeChange(key: string, value: ProductAttributeValue) {
    setAttributes((prev) => ({ ...prev, [key]: value }))
  }

  function renderField(field: ProductField) {
    const value = attributes[field.key] ?? ''
    const inputValue = typeof value === 'boolean' ? '' : value

    switch (field.type) {
      case 'TEXT':
      case 'RICH_TEXT':
      case 'NUMBER':
      case 'CURRENCY':
        return (
          <input
            type={field.type === 'NUMBER' || field.type === 'CURRENCY' ? 'number' : 'text'}
            value={inputValue}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className={`w-full ${inputClass}`}
          />
        )

      case 'BOOLEAN':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleAttributeChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent"
          />
        )

      case 'DATE':
        return (
          <input
            type="date"
            value={inputValue}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className={`w-full ${inputClass}`}
          />
        )

      case 'DROPDOWN':
        return (
          <select
            value={inputValue}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className={`w-full ${inputClass}`}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'RADIO':
        return (
          <div className="space-y-1.5">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  name={field.key}
                  value={opt}
                  checked={value === opt}
                  onChange={() => handleAttributeChange(field.key, opt)}
                  className="h-4 w-4 border-border text-primary focus:ring-2 focus:ring-accent"
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
            value={inputValue || '#000000'}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className="h-10 w-20 cursor-pointer rounded-md border border-border"
          />
        )

      case 'TAG':
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            placeholder="Comma separated tags"
            className={`w-full ${inputClass}`}
          />
        )

      default:
        return (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className={`w-full ${inputClass}`}
          />
        )
    }
  }

  function addVariantOption() {
    setVariantOptions((prev) => [...prev, { name: '', values: '' }])
  }

  function updateVariantOption(index: number, field: 'name' | 'values', value: string) {
    setVariantOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)))
  }

  function removeVariantOption(index: number) {
    setVariantOptions((prev) => prev.filter((_, i) => i !== index))
  }

  function handleGenerateCombinations() {
    setVariants(generateCombinations(variantOptions))
  }

  function updateVariantRow(
    index: number,
    field: 'description' | 'price' | 'stock' | 'sku' | 'imageFilename',
    value: string
  ) {
    setVariants((prev) => prev.map((row, i) => {
      if (i !== index) return row
      if (field === 'imageFilename') {
        return { ...row, imageFilename: value, imageStatus: 'idle', imageMessage: '' }
      }
      return { ...row, [field]: value }
    }))
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  async function verifyProductImage() {
    setImageStatus('checking')
    setImageMessage('Checking file...')
    const filename = imageFilename
    const verificationError = await verifyCatalogImageFile(filename, 'products')

    if (imageFilenameRef.current !== filename) return
    setImageStatus(verificationError ? 'error' : 'verified')
    setImageMessage(
      verificationError || `Verified: ${getCatalogImagePath('products', filename)}`
    )
  }

  async function verifyVariantImage(index: number) {
    const filename = variants[index]?.imageFilename ?? ''
    setVariants((prev) => prev.map((row, i) => (
      i === index ? { ...row, imageStatus: 'checking', imageMessage: 'Checking file...' } : row
    )))

    const verificationError = await verifyCatalogImageFile(filename, 'variants')
    setVariants((prev) => prev.map((row, i) => {
      if (i !== index || row.imageFilename !== filename) return row
      return {
        ...row,
        imageStatus: verificationError ? 'error' : 'verified',
        imageMessage: verificationError || `Verified: ${getCatalogImagePath('variants', filename)}`,
      }
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (variants.length === 0) {
      setError('Add at least one variant option and generate combinations before submitting.')
      return
    }
    if (variants.some((v) => v.price === '' || v.stock === '')) {
      setError('Every variant needs a price and stock value.')
      return
    }
    if (imageStatus !== 'verified') {
      setError('Verify the main product image before creating the product.')
      return
    }
    if (variants.some((v) => v.imageFilename.trim() && v.imageStatus !== 'verified')) {
      setError('Verify every variant image filename that has been entered.')
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

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          imageUrl: getCatalogImagePath('products', imageFilename),
          productTypeId: selectedTypeId,
          attributes,
          variantOptions: variantOptionsJson,
          variants: variants.map((variant) => ({
            combination: variant.combination,
            description: variant.description,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            imageUrl: variant.imageFilename.trim()
              ? getCatalogImagePath('variants', variant.imageFilename)
              : '',
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const imagesVerified = imageStatus === 'verified' && variants.every(
    (variant) => !variant.imageFilename.trim() || variant.imageStatus === 'verified'
  )

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <Package className="h-6 w-6 text-accent" aria-hidden="true" />
        New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-1.5 rounded-md bg-error/10 px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Product Type</h2>
          <select
            value={selectedTypeId}
            onChange={(e) => {
              setSelectedTypeId(e.target.value)
              setAttributes({})
            }}
            required
            className={`w-full ${inputClass}`}
          >
            <option value="">Select a product type...</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {selectedType && (
          <>
            <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-primary">Basic Info</h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Nike Air Force 1"
                  className={`w-full ${inputClass}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional product description"
                  className={`w-full ${inputClass}`}
                />
              </div>

              <div>
                <label htmlFor="productImageFilename" className="mb-1.5 block text-sm font-medium text-text">
                  Product Image Filename <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="productImageFilename"
                    type="text"
                    value={imageFilename}
                    onChange={(e) => {
                      imageFilenameRef.current = e.target.value
                      setImageFilename(e.target.value)
                      setImageStatus('idle')
                      setImageMessage('')
                    }}
                    placeholder="charizard-ex.webp"
                    required
                    className={`min-w-0 flex-1 ${inputClass}`}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={verifyProductImage}
                    disabled={!imageFilename.trim() || imageStatus === 'checking'}
                    className="shrink-0 gap-1.5"
                  >
                    {imageStatus === 'checking' ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : imageStatus === 'verified' ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                    {imageStatus === 'checking' ? 'Checking' : imageStatus === 'verified' ? 'Verified' : 'Verify'}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-text-light">
                  File location: public/images/products/ · Recommended: 1000 × 1000 WebP
                </p>
                {imageMessage && (
                  <p className={`mt-1 text-sm ${
                    imageStatus === 'verified'
                      ? 'text-success'
                      : imageStatus === 'error'
                        ? 'text-error'
                        : 'text-text-muted'
                  }`}>
                    {imageMessage}
                  </p>
                )}
              </div>
            </div>

            {selectedType.fields.length > 0 && (
              <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold text-primary">{selectedType.name} Details</h2>
                {selectedType.fields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1.5 block text-sm font-medium text-text">
                      {field.label}
                      {field.required && <span className="ml-1 text-error">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-primary">Variants</h2>
                <button
                  type="button"
                  onClick={addVariantOption}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-accent"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add Option
                </button>
              </div>

              <p className="text-xs text-text-muted">
                Add one row per option (e.g. &ldquo;Size&rdquo; or &ldquo;Color&rdquo;). In the second box, list
                every value for that option separated by commas — e.g.{' '}
                <span className="font-medium text-text">7, 8, 9</span>. Then click &ldquo;Generate
                Combinations&rdquo; to build the price/stock table below from every combination.
              </p>

              {variantOptions.length === 0 && (
                <p className="text-sm text-text-muted">
                  No variant options yet. Add one (e.g. &ldquo;Size&rdquo;) to get started.
                </p>
              )}

              {variantOptions.map((opt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <input
                    type="text"
                    value={opt.name}
                    onChange={(e) => updateVariantOption(i, 'name', e.target.value)}
                    placeholder="Option name (e.g. Size)"
                    className={`w-1/3 ${inputClass}`}
                  />
                  <input
                    type="text"
                    value={opt.values}
                    onChange={(e) => updateVariantOption(i, 'values', e.target.value)}
                    placeholder="Comma separated values (e.g. 7, 8, 9)"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantOption(i)}
                    className="flex items-center px-2 py-2 text-error transition-colors hover:text-error/80"
                    aria-label="Remove option"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {variantOptions.length > 0 && (
                <Button type="button" variant="secondary" size="sm" onClick={handleGenerateCombinations}>
                  Generate Combinations
                </Button>
              )}

              {variants.length > 0 && (
                <div className="overflow-x-auto rounded-md border border-border-light">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-surface-muted">
                      <tr className="text-left text-text-muted">
                        <th className="px-3 py-2 font-medium">Combination</th>
                        <th className="px-3 py-2 font-medium">Contents / description</th>
                        <th className="px-3 py-2 font-medium">Price (SGD)</th>
                        <th className="px-3 py-2 font-medium">Stock</th>
                        <th className="px-3 py-2 font-medium">SKU (optional)</th>
                        <th className="px-3 py-2 font-medium">Image filename (optional)</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((row, i) => (
                        <tr key={i} className="border-t border-border-light">
                          <td className="whitespace-nowrap px-3 py-2 text-text">
                            {Object.entries(row.combination).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </td>
                          <td className="px-3 py-2">
                            <textarea
                              value={row.description}
                              onChange={(e) => updateVariantRow(i, 'description', e.target.value)}
                              rows={5}
                              className={`w-72 resize-y ${cellInputClass}`}
                              placeholder="One product-content item per line"
                              aria-label={`Description for variant ${i + 1}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={row.price}
                              onChange={(e) => updateVariantRow(i, 'price', e.target.value)}
                              required
                              className={`w-24 ${cellInputClass}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              value={row.stock}
                              onChange={(e) => updateVariantRow(i, 'stock', e.target.value)}
                              required
                              className={`w-20 ${cellInputClass}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.sku}
                              onChange={(e) => updateVariantRow(i, 'sku', e.target.value)}
                              className={`w-32 ${cellInputClass}`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                onChange={(e) => updateVariantRow(i, 'imageFilename', e.target.value)}
                                value={row.imageFilename}
                                className={`w-40 ${cellInputClass}`}
                                placeholder="variant.webp"
                                aria-label={`Image filename for variant ${i + 1}`}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => verifyVariantImage(i)}
                                disabled={!row.imageFilename.trim() || row.imageStatus === 'checking'}
                                className="shrink-0 gap-1.5"
                              >
                                {row.imageStatus === 'checking' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : row.imageStatus === 'verified' ? (
                                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                ) : null}
                                {row.imageStatus === 'checking' ? 'Checking' : row.imageStatus === 'verified' ? 'Verified' : 'Verify'}
                              </Button>
                            </div>
                            {row.imageMessage && (
                              <p className={`mt-1 max-w-64 text-xs ${
                                row.imageStatus === 'verified'
                                  ? 'text-success'
                                  : row.imageStatus === 'error'
                                    ? 'text-error'
                                    : 'text-text-muted'
                              }`}>
                                {row.imageMessage}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeVariantRow(i)}
                              className="text-error transition-colors hover:text-error/80"
                              aria-label="Remove variant"
                            >
                              <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading || !imagesVerified} className="w-full">
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
            {!imagesVerified && (
              <p className="text-center text-sm text-text-muted">
                Verify the main image and every entered variant image before creating the product.
              </p>
            )}
          </>
        )}
      </form>
    </div>
  )
}
