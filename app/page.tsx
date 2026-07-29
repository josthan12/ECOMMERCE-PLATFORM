import type { Metadata } from 'next'
import HeroBanner from './components/homepage/HeroBanner'
import CategoryGrid from './components/homepage/CategoryGrid'
import FeaturedProducts from './components/homepage/FeaturedProducts'
import Newsletter from './components/homepage/Newsletter'

export const metadata: Metadata = {
  title: { absolute: 'PokeSunshineTCG | You are my sunshine' },
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <Newsletter />
    </>
  )
}
