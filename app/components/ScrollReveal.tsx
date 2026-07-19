'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mql.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true)
      return
    }
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
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