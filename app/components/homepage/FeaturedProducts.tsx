import { prisma } from '@/lib/prisma'
import ProductCard from '../ProductCard'
import ScrollReveal from '../ScrollReveal'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { archived: false },
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  if (products.length === 0) return null

  return (
    <section id="featured" className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <ScrollReveal>
        <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
          New Arrivals
        </h2>
      </ScrollReveal>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((product, index) => (
          <ScrollReveal key={product.id} delayMs={index * 60}>
            <ProductCard product={product} headingLevel="h3" showOutOfStockBadge={false} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}