import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'FAQ/T&C', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary text-text-inverse">
      <div className="mx-auto max-w-[1400px] px-4 py-10 text-center md:px-8 md:py-12">
        <p className="text-sm text-text-inverse/70">
          Authentic Pokémon cards, sealed products, and collector favorites.
        </p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-inverse/80 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-xs text-text-inverse/50">
          © {new Date().getFullYear()} PokeSunshineTCG. All rights reserved.
        </p>
      </div>
    </footer>
  )
}