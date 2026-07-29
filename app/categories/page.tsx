import type { Metadata } from 'next'
import { FolderOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { absoluteUrl, serializeJsonLd } from '@/lib/structuredData'
import BackButton from '../components/BackButton'
import CategoryCard from '../components/CategoryCard'
import ScrollReveal from '../components/ScrollReveal'

export const metadata: Metadata = {
  title: 'TCG Categories',
  description: 'Explore every trading card game category available from PokeSunshineTCG.',
  alternates: { canonical: '/categories' },
}

export default async function CategoriesPage() {
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
    orderBy: { name: 'asc' },
  })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: absoluteUrl('/categories'),
      },
    ],
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <BackButton />

      <ScrollReveal>
        <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
          The catalogue
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-primary md:text-6xl">
          Categories
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
          Browse every TCG collection, then explore the products available in each one.
        </p>
      </ScrollReveal>

      {categories.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-xl border border-border-light bg-surface py-16 text-center">
          <FolderOpen className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No categories are available yet.</p>
          <p className="mt-1 text-sm text-text-muted">Check back as the catalogue grows.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <ScrollReveal key={category.id} delayMs={Math.min(index * 60, 240)}>
              <CategoryCard
                category={category}
                productCount={category._count.products}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
