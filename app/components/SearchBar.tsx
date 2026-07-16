'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Suggestion {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  price: string
  category: string | null
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) return
        const data = await res.json()
        setSuggestions(data.results)
        setIsOpen(true)
      } catch {
        // Silently ignore — suggestions are a non-critical enhancement,
        // the plain Enter-to-search flow still works regardless.
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsOpen(false)
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          autoComplete="off"
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 overflow-hidden">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-sm"
            >
              <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0">
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 truncate">{product.name}</p>
                {product.category && (
                  <p className="text-xs text-gray-400">{product.category}</p>
                )}
              </div>
              <span className="text-gray-600 flex-shrink-0">{product.price}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}