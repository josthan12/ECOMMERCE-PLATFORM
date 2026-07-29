'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, FolderTree, Loader2 } from 'lucide-react'
import Button from '../../../../components/ui/Button'
import {
  getCatalogImageFilename,
  getCatalogImagePath,
  verifyCatalogImageFile,
} from '@/lib/catalogImages'

type Product = {
  id: string
  name: string
}

type ImageVerificationStatus = 'idle' | 'checking' | 'verified' | 'error'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const categoryId = params.id

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFilename, setImageFilename] = useState('')
  const imageFilenameRef = useRef('')
  const [legacyImageUrl, setLegacyImageUrl] = useState('')
  const [imageStatus, setImageStatus] = useState<ImageVerificationStatus>('idle')
  const [imageMessage, setImageMessage] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, categoryRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch(`/api/admin/categories/${categoryId}`),
        ])

        setProducts(await productsRes.json())

        if (!categoryRes.ok) {
          throw new Error('Category not found')
        }
        const categoryData = await categoryRes.json()

        setName(categoryData.name)
        setDescription(categoryData.description || '')
        const categoryImageFilename = getCatalogImageFilename(
          categoryData.bannerImageUrl,
          'categories'
        ) || ''
        imageFilenameRef.current = categoryImageFilename
        setImageFilename(categoryImageFilename)
        setLegacyImageUrl(
          categoryData.bannerImageUrl && !categoryImageFilename
            ? categoryData.bannerImageUrl
            : ''
        )
        setImageStatus('idle')
        setImageMessage(
          categoryImageFilename
            ? `Loaded: ${categoryData.bannerImageUrl}. Verify before saving.`
            : categoryData.bannerImageUrl
              ? 'Replace the current remote image with a local filename and verify it.'
              : 'Add and verify a category image before saving.'
        )
        setSeoTitle(categoryData.seoTitle || '')
        setSeoDescription(categoryData.seoDescription || '')
        setSelectedProductIds(categoryData.productIds)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }

    loadData()
  }, [categoryId])

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  async function verifyCategoryImage() {
    setImageStatus('checking')
    setImageMessage('Checking file...')
    const filename = imageFilename
    const verificationError = await verifyCatalogImageFile(filename, 'categories')

    if (imageFilenameRef.current !== filename) return
    setImageStatus(verificationError ? 'error' : 'verified')
    setLegacyImageUrl(verificationError ? legacyImageUrl : '')
    setImageMessage(
      verificationError || `Verified: ${getCatalogImagePath('categories', filename)}`
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (imageStatus !== 'verified') {
      setError('Verify the category image before saving.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          bannerImageUrl: getCatalogImagePath('categories', imageFilename),
          seoTitle,
          seoDescription,
          productIds: selectedProductIds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/categories')
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
        <FolderTree className="h-6 w-6 text-accent" aria-hidden="true" />
        Edit Category
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
              Category Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Sneakers"
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
              rows={3}
              placeholder="Optional category description"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="categoryImageFilename" className="mb-1.5 block text-sm font-medium text-text">
              Category Image Filename <span className="text-error">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="categoryImageFilename"
                type="text"
                value={imageFilename}
                onChange={(e) => {
                  imageFilenameRef.current = e.target.value
                  setImageFilename(e.target.value)
                  setImageStatus('idle')
                  setImageMessage('')
                }}
                placeholder="pokemon-en.webp"
                required
                className="min-h-[44px] min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={verifyCategoryImage}
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
              File location: public/images/categories/ · Recommended: 1024 × 1024 WebP
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

        <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">SEO</h2>

          <div>
            <label htmlFor="seoTitle" className="mb-1.5 block text-sm font-medium text-text">
              SEO Title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Defaults to category name if left blank"
              className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="seoDescription" className="mb-1.5 block text-sm font-medium text-text">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              placeholder="Optional meta description"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Assign Products</h2>

          {products.length === 0 ? (
            <p className="text-sm text-text-muted">No products yet.</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border-light">
              {products.map((product) => (
                <label
                  key={product.id}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-border-light px-3 py-2.5 text-sm text-text transition-colors last:border-b-0 hover:bg-surface-hover"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-accent"
                  />
                  {product.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading || imageStatus !== 'verified'} className="w-full">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        {imageStatus !== 'verified' && (
          <p className="text-center text-sm text-text-muted">
            Verify the category image before saving.
          </p>
        )}
      </form>
    </div>
  )
}
