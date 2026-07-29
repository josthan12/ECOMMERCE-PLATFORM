'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

/**
 * Reveals its children once, the first time they scroll into view.
 * Never re-hides or loops — a single, quiet moment per element,
 * matching DESIGN_SYSTEM.md's "almost invisible" motion principle.
 * Respects prefers-reduced-motion by skipping straight to visible.
 */
export default function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  )
  const isVisible = reducedMotion || hasIntersected

  useEffect(() => {
    if (reducedMotion) return

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-[350ms] ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className
      )}
      style={{ transitionDelay: reducedMotion ? '0ms' : `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
