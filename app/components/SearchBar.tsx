'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, Loader2, ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import CatalogImage from './CatalogImage'

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
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    let cancelled = false
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setSuggestions(data.results)
          setIsOpen(true)
        }
      } catch {
        // Silently ignore — suggestions are a non-critical enhancement,
        // the plain Enter-to-search flow still works regardless.
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
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
      inputRef.current?.blur()
    }
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      setIsLoading(true)
      return
    }

    setSuggestions([])
    setIsOpen(false)
    setIsLoading(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form role="search" aria-label="Product search" onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-light"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search cards, sets, or Pokémon..."
            autoComplete="off"
            aria-label="Search products"
            className={cn(
              'w-full rounded-md border border-border bg-surface py-2 pl-9 pr-9 text-sm text-text',
              'placeholder:text-text-light',
              'transition-shadow duration-150 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'
            )}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-light" aria-hidden="true" />
            ) : query ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-text-light transition-colors hover:text-text"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border-light bg-surface shadow-dropdown">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 border-b border-border-light px-3 py-2.5 text-sm last:border-b-0 hover:bg-surface-hover"
            >
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted">
                {product.imageUrl ? (
                  <CatalogImage
                    src={product.imageUrl}
                    alt=""
                    sizes="44px"
                    className="p-1"
                  />
                ) : (
                  <ImageOff className="h-4 w-4 text-text-light" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-text">{product.name}</p>
                {product.category && (
                  <p className="truncate text-xs text-text-muted">{product.category}</p>
                )}
              </div>
              <span className="flex-shrink-0 font-medium text-primary">{product.price}</span>
            </Link>
          ))}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {isLoading
          ? 'Loading product suggestions'
          : isOpen && suggestions.length > 0
            ? `${suggestions.length} product ${suggestions.length === 1 ? 'suggestion' : 'suggestions'} available`
            : ''}
      </p>
    </div>
  )
}
