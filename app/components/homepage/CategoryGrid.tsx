import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ScrollReveal from '../ScrollReveal'
import CategoryCarousel from './CategoryCarousel'

export default async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: { product: { archived: false } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (categories.length === 0) return null

  return (
    <section id="categories" className="scroll-mt-40 bg-surface-muted/55 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <ScrollReveal className="flex items-end justify-between gap-5">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.025em] text-primary md:text-5xl">
            Categories
          </h2>
          <Link
            href="/categories"
            className="group hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
          >
            View all categories
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </ScrollReveal>

        <CategoryCarousel
          categories={categories.map((category) => ({
            id: category.id,
            slug: category.slug,
            name: category.name,
            description: category.description,
            bannerImageUrl: category.bannerImageUrl,
            productCount: category._count.products,
          }))}
        />

        <Link
          href="/categories"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary sm:hidden"
        >
          View all categories
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
