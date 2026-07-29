import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../ProductCard'
import ScrollReveal from '../ScrollReveal'

export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { archived: false },
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  if (products.length === 0) return null

  return (
    <section id="new-arrivals" className="scroll-mt-40 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <ScrollReveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.025em] text-primary md:text-5xl">
              New arrivals
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Browse all products
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((product, index) => (
            <ScrollReveal
              key={product.id}
              delayMs={Math.min(index * 50, 250)}
              className="h-full"
            >
              <ProductCard product={product} headingLevel="h3" />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
