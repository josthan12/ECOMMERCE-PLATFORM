'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, Package, Plus, X, Lock } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import {
  getCatalogImageFilename,
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
type VariantRow = {
  id?: string
  combination: Record<string, string>
  price: string
  stock: string
  sku: string
  imageFilename: string
  legacyImageUrl: string
  imageStatus: ImageVerificationStatus
  imageMessage: string
}

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
    price: '',
    stock: '',
    sku: '',
    imageFilename: '',
    legacyImageUrl: '',
    imageStatus: 'idle',
    imageMessage: '',
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
  const [imageFilename, setImageFilename] = useState('')
  const imageFilenameRef = useRef('')
  const [legacyImageUrl, setLegacyImageUrl] = useState('')
  const [imageStatus, setImageStatus] = useState<ImageVerificationStatus>('idle')
  const [imageMessage, setImageMessage] = useState('')
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
        const productImageFilename = getCatalogImageFilename(product.imageUrl, 'products') || ''
        imageFilenameRef.current = productImageFilename
        setImageFilename(productImageFilename)
        setLegacyImageUrl(product.imageUrl && !productImageFilename ? product.imageUrl : '')
        setImageStatus('idle')
        setImageMessage(
          productImageFilename
            ? `Loaded: ${product.imageUrl}. Verify before saving.`
            : product.imageUrl
              ? 'Replace the current remote image with a local filename and verify it.'
              : 'Add and verify a main product image before saving.'
        )
        setAttributes(product.attributes || {})

        const optionsArray: VariantOption[] = Object.entries(product.variantOptions || {}).map(
          ([optName, values]) => ({ name: optName, values: (values as string[]).join(', ') })
        )
        setVariantOptions(optionsArray)

        const variantRows: VariantRow[] = product.variants.map((v: any) => {
          const variantImageFilename = getCatalogImageFilename(v.imageUrl, 'variants') || ''
          return {
            id: v.id,
            combination: v.combination,
            price: v.price.toString(),
            stock: v.stock.toString(),
            sku: v.sku || '',
            imageFilename: variantImageFilename,
            legacyImageUrl: v.imageUrl && !variantImageFilename ? v.imageUrl : '',
            imageStatus: 'idle',
            imageMessage: variantImageFilename
              ? `Loaded: ${v.imageUrl}. Verify before saving.`
              : v.imageUrl
                ? 'Replace or remove this legacy remote image.'
                : '',
          }
        })
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
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            required={field.required}
            className={`w-full ${inputClass}`}
          />
        )

      case 'DROPDOWN':
        return (
          <select
            value={value}
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
            value={value || '#000000'}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            className="h-10 w-20 cursor-pointer rounded-md border border-border"
          />
        )

      case 'TAG':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAttributeChange(field.key, e.target.value)}
            placeholder="Comma separated tags"
            className={`w-full ${inputClass}`}
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
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
    const generated = generateCombinations(variantOptions)
    const existingKeys = new Set(variants.map((v) => comboKey(v.combination)))
    const newRows = generated.filter((g) => !existingKeys.has(comboKey(g.combination)))
    setVariants((prev) => [...prev, ...newRows])
  }

  function updateVariantRow(index: number, field: 'price' | 'stock' | 'sku' | 'imageFilename', value: string) {
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

  function removeLegacyVariantImage(index: number) {
    setVariants((prev) => prev.map((row, i) => (
      i === index ? { ...row, legacyImageUrl: '', imageMessage: '' } : row
    )))
  }

  async function verifyProductImage() {
    setImageStatus('checking')
    setImageMessage('Checking file...')
    const filename = imageFilename
    const verificationError = await verifyCatalogImageFile(filename, 'products')

    if (imageFilenameRef.current !== filename) return
    setImageStatus(verificationError ? 'error' : 'verified')
    setLegacyImageUrl(verificationError ? legacyImageUrl : '')
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
        legacyImageUrl: verificationError ? row.legacyImageUrl : '',
        imageStatus: verificationError ? 'error' : 'verified',
        imageMessage: verificationError || `Verified: ${getCatalogImagePath('variants', filename)}`,
      }
    }))
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
    if (imageStatus !== 'verified') {
      setError('Verify the main product image before saving.')
      return
    }
    if (variants.some((v) => v.legacyImageUrl)) {
      setError('Replace or remove every legacy remote variant image before saving.')
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

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          imageUrl: getCatalogImagePath('products', imageFilename),
          attributes,
          variantOptions: variantOptionsJson,
          variants: variants.map((variant) => ({
            id: variant.id,
            combination: variant.combination,
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="max-w-2xl text-sm text-text-muted">Loading...</div>
  }

  const imagesVerified = imageStatus === 'verified' && variants.every(
    (variant) => !variant.legacyImageUrl
      && (!variant.imageFilename.trim() || variant.imageStatus === 'verified')
  )

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
        <Package className="h-6 w-6 text-accent" aria-hidden="true" />
        Edit Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-1.5 rounded-md bg-error/10 px-4 py-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-2 rounded-lg border border-border-light bg-surface-muted/60 p-6">
          <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold text-primary">
            <Lock className="h-4 w-4 text-text-light" aria-hidden="true" />
            Product Type
          </h2>
          <p className="text-sm text-text">{productType?.name}</p>
          <p className="text-xs text-text-light">
            Product type cannot be changed after creation. Create a new product to use a different type.
          </p>
        </div>

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
            {legacyImageUrl && (
              <p className="mt-1 break-all text-xs text-warning">Current remote image: {legacyImageUrl}</p>
            )}
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

        {productType && productType.fields.length > 0 && (
          <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-primary">{productType.name} Details</h2>
            {productType.fields.map((field) => (
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
            <span className="font-medium text-text">7, 8, 9</span>. New combinations are added to the table
            below without disturbing existing rows you&apos;ve already priced.
          </p>

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
              Add New Combinations
            </Button>
          )}

          {variants.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border-light">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface-muted">
                  <tr className="text-left text-text-muted">
                    <th className="px-3 py-2 font-medium">Combination</th>
                    <th className="px-3 py-2 font-medium">Price (SGD)</th>
                    <th className="px-3 py-2 font-medium">Stock</th>
                    <th className="px-3 py-2 font-medium">SKU (optional)</th>
                    <th className="px-3 py-2 font-medium">Image filename (optional)</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((row, i) => (
                    <tr key={row.id ?? `new-${i}`} className="border-t border-border-light">
                      <td className="whitespace-nowrap px-3 py-2 text-text">
                        {Object.entries(row.combination).map(([k, v]) => `${k}: ${v}`).join(', ')}
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
                            value={row.imageFilename}
                            onChange={(e) => updateVariantRow(i, 'imageFilename', e.target.value)}
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
                        {row.legacyImageUrl && (
                          <div className="mt-1 max-w-64 text-xs text-warning">
                            <p className="break-all">Legacy remote image: {row.legacyImageUrl}</p>
                            <button
                              type="button"
                              onClick={() => removeLegacyVariantImage(i)}
                              className="mt-1 font-medium underline underline-offset-2"
                            >
                              Remove legacy image
                            </button>
                          </div>
                        )}
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
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {!imagesVerified && (
          <p className="text-center text-sm text-text-muted">
            Verify the main image and every entered variant image, and replace or remove legacy remote variant images before saving.
          </p>
        )}
      </form>
    </div>
  )
}
