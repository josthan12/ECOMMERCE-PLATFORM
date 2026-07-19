'use client'

// Non-functional for now — no email provider wired up yet.
// Submit handler intentionally does nothing beyond preventing default.
import ScrollReveal from '../ScrollReveal'
import Button from '../ui/Button'

export default function Newsletter() {
  return (
    <section className="bg-primary py-16">
      <ScrollReveal className="mx-auto max-w-[1400px] px-4 text-center md:px-8">
        <h2 className="font-display text-2xl font-semibold text-text-inverse md:text-3xl">
          Stay in the loop
        </h2>
        <p className="mt-2 text-text-inverse/70">
          Get updates on new arrivals and collector favorites.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-6 flex max-w-md flex-col justify-center gap-3 sm:flex-row"
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="flex-1 rounded-md border border-transparent bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" variant="accent">
            Subscribe
          </Button>
        </form>
      </ScrollReveal>
    </section>
  )
}