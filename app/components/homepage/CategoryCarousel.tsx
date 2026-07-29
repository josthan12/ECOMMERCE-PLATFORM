'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CategoryCard from '../CategoryCard'

export type CategoryCarouselItem = {
  id: string
  slug: string
  name: string
  description: string | null
  bannerImageUrl: string | null
  productCount: number
}

export default function CategoryCarousel({
  categories,
}: {
  categories: CategoryCarouselItem[]
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateControls = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    setCanScrollLeft(scroller.scrollLeft > 2)
    setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    updateControls()
    scroller.addEventListener('scroll', updateControls, { passive: true })

    const resizeObserver = new ResizeObserver(updateControls)
    resizeObserver.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateControls)
      resizeObserver.disconnect()
    }
  }, [updateControls])

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const scroller = scrollerRef.current
    const firstSlide = scroller?.querySelector<HTMLElement>('[data-category-slide]')
    if (!scroller || !firstSlide) return

    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    scroller.scrollBy({
      left: direction * (firstSlide.offsetWidth + gap),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [])

  return (
    <div className="mt-10">
      <div
        ref={scrollerRef}
        id="category-carousel"
        role="region"
        aria-label="TCG categories"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollByCard(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollByCard(1)
          }
        }}
        className="grid snap-x snap-mandatory grid-flow-col auto-cols-[100%] gap-5 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 sm:auto-cols-[calc((100%-1.25rem)/2)] lg:auto-cols-[calc((100%-2.5rem)/3)] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => (
          <div
            key={category.id}
            data-category-slide
            role="group"
            aria-label={`${index + 1} of ${categories.length}`}
            className="snap-start"
          >
            <CategoryCard
              category={category}
              productCount={category.productCount}
              headingLevel="h3"
              imageSizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {categories.length > 1 && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous category"
            aria-controls="category-carousel"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-input transition-colors hover:border-accent hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollRight}
            aria-label="Next category"
            aria-controls="category-carousel"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-input transition-colors hover:border-accent hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
