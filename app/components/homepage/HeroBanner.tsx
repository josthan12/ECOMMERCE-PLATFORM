import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import HeroArtwork from './HeroArtwork'

export default function HeroBanner() {
  return (
    <section className="sunshine-landing relative isolate flex min-h-[calc(100svh-7.5rem)] overflow-hidden border-b border-border-light">
      <div className="sunshine-glow sunshine-glow-left" aria-hidden="true" />
      <div className="sunshine-glow sunshine-glow-right" aria-hidden="true" />
      <div className="sunshine-rays" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-16">
        <div className="relative z-10 order-2 max-w-2xl text-center lg:order-1 lg:text-left">
          <h1 className="sunshine-wordmark font-display text-[clamp(2.8rem,7vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-primary">
            PokeSunshine
            <span className="block text-accent">TCG</span>
          </h1>

          <p className="sunshine-tagline mt-7 font-display text-xl font-medium tracking-[-0.025em] text-text md:text-2xl">
            You are my sunshine.
          </p>

          <div className="sunshine-actions mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/#new-arrivals"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition-all duration-[250ms] hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Shop featured products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border-strong bg-surface/55 px-6 py-3 text-sm font-semibold text-primary backdrop-blur-sm transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-accent hover:bg-surface"
            >
              Explore TCGs
            </Link>
          </div>
        </div>

        <HeroArtwork />

        <Link
          href="/categories"
          className="sunshine-scroll absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-medium text-text-muted transition-colors hover:text-primary md:flex"
        >
          Scroll to explore
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
