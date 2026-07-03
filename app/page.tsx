import HeroBanner from './components/homepage/HeroBanner'
import FeaturedProducts from './components/homepage/FeaturedProducts'
import CategoryGrid from './components/homepage/CategoryGrid'
import Newsletter from './components/homepage/Newsletter'

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <FeaturedProducts />
      <CategoryGrid />
      <Newsletter />
    </div>
  )
}