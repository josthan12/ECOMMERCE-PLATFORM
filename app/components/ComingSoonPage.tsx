import Link from 'next/link'
import { Clock } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description?: string
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center md:px-8">
      <Clock className="h-8 w-8 text-text-light" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-primary md:text-3xl">{title}</h1>
      <p className="mt-3 text-text-muted">
        {description ?? "This page is on its way — we're still putting it together."}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 text-text-inverse transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-primary"
      >
        Back to homepage
      </Link>
    </div>
  )
}