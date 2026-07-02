'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
}

export default function NewCategoryPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          bannerImageUrl,
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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Category</h1>

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
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Sneakers"
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
              placeholder="Optional category description"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image URL
            </label>
            <input
              type="text"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">SEO</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Defaults to category name if left blank"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={2}
              placeholder="Optional meta description"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Assign Products</h2>

          {products.length === 0 ? (
            <p className="text-sm text-gray-500">No products yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4"
                  />
                  {product.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>
    </div>
  )
}