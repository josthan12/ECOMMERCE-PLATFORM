//USE FOR STATIC ONLY NOT FOR ANIMATED
//HERO BANNER WILL NO LONGER USE THIS

import type { ReactNode } from 'react'
import { Sparkle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface HeroCardAccentProps {
  /**
   * Real artwork to display on the card face (e.g. a featured TCG card,
   * seasonal set art). When omitted, falls back to the gradient + icon
   * placeholder below — swap this in whenever real art is ready.
   */
  imageUrl?: string
  alt?: string
  /** Icon shown over the gradient placeholder when no imageUrl is set. Defaults to Sparkle. */
  icon?: ReactNode
  /** Extra classes for one-off tweaks without touching this file. */
  className?: string
}

/**
 * Fixed-dimension hero accent card. Dimensions, radius, shadow, and the
 * one-time shine sweep are locked to the established spec — only the face
 * content (image vs. gradient/icon) is meant to change over time.
 *
 * Usage:
 *   <HeroCardAccent />                                      // current placeholder
 *   <HeroCardAccent imageUrl="/hero/charizard-set.png" alt="..." />  // real art later
 */
export default function HeroCardAccent({
  imageUrl,
  alt = '',
  icon = <Sparkle className="h-8 w-8 text-text-inverse/25" strokeWidth={1.25} aria-hidden="true" />,
  className,
}: HeroCardAccentProps) {
  return (
    <div className={cn('animate-fade-up-delay-3 w-36 sm:w-44', className)}>
      <div className="relative aspect-[5/7] overflow-hidden rounded-lg border border-border-strong shadow-dropdown">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary via-secondary to-accent">
            {icon}
          </div>
        )}

        {/* One-time shine sweep — fires once on mount, never loops. */}
        <div
          aria-hidden="true"
          className="animate-shine absolute inset-y-0 w-2/5 bg-linear-to-r from-transparent via-white/45 to-transparent blur-[6px]"
        />
      </div>
    </div>
  )
}