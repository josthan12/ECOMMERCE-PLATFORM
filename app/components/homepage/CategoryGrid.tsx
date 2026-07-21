import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import ScrollReveal from '../ScrollReveal'

export default async function CategoryGrid() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' },
  })

  if (categories.length === 0) return null

  return (
    <section id="categories" className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
      <ScrollReveal>
        <h2 className="font-display text-2xl font-semibold text-primary md:text-3xl">
          Shop by Category
        </h2>
      </ScrollReveal>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 md:grid-cols-4">
        {categories.map((category, index) => (
          <ScrollReveal key={category.id} delayMs={index * 60}>
            <Link
              href={`/category/${category.slug}`}
              className="group block overflow-hidden rounded-lg border border-border-light bg-surface shadow-card transition-all duration-250 ease-out hover:-translate-y-1.5 hover:border-accent hover:shadow-dropdown"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                {category.bannerImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.bannerImageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[350ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-text-light" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-text">{category.name}</h3>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}