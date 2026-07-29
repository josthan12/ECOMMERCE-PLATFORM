'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'

export default function HeroArtwork() {
  const artworkRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(true)

  useEffect(() => {
    const artwork = artworkRef.current
    if (!artwork) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '120px' }
    )

    observer.observe(artwork)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={artworkRef}
      className={cn(
        'sunshine-art-reveal relative order-1 mx-auto aspect-square w-full max-w-[34rem] lg:order-2',
        !isInView && 'sunshine-motion-paused'
      )}
    >
      <div className="sunshine-rays-local absolute inset-[-1%] rounded-full" aria-hidden="true" />
      <div className="sunshine-orbit absolute inset-[2%] rounded-full" aria-hidden="true" />
      <span className="sunshine-spark sunshine-spark-one" aria-hidden="true" />
      <span className="sunshine-spark sunshine-spark-two" aria-hidden="true" />
      <span className="sunshine-spark sunshine-spark-three" aria-hidden="true" />

      <div className="sunshine-logo-float absolute inset-[8%]">
        <div className="sunshine-logo-frame absolute inset-0 overflow-hidden rounded-full border border-white/70 bg-surface shadow-modal">
          <Image
            src="/images/brand/pokesunshine-logo.png"
            alt="PokeSunshineTCG sun mascot"
            fill
            preload
            sizes="(max-width: 1023px) 82vw, 544px"
            className="object-cover"
          />
          <span className="sunshine-logo-sheen absolute inset-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
