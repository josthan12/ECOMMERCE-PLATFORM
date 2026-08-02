import Image from 'next/image'
import Link from 'next/link'

const FOOTER_GROUPS = [
  {
    title: 'Shop',
    links: [
      { label: 'TCG collections', href: '/categories' },
      { label: 'New arrivals', href: '/#new-arrivals' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Frequently asked questions', href: '/faq' },
      { label: 'Contact us', href: '/contact' },
      { label: 'My orders', href: '/account/orders' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About PokeSunshineTCG', href: '/about' },
      { label: 'Newsletter', href: '/#newsletter' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-ink text-on-ink">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label="PokeSunshineTCG home"
            >
              <span className="relative h-11 w-11 overflow-hidden rounded-full border border-accent/60 bg-surface">
                <Image
                  src="/images/brand/pokesunshine-logo.png"
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="font-display text-xl font-semibold tracking-[0.02em]">
                PokeSunshine<span className="text-accent-light">TCG</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-on-ink-muted">
              Authentic trading cards and sealed products, selected and presented for
              collectors who care about the details.
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-accent-light uppercase">
              Based in Singapore
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={`${group.title} links`}>
              <h2 className="text-xs font-semibold tracking-[0.14em] text-on-ink uppercase">
                {group.title}
              </h2>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-on-ink-muted transition-colors hover:text-accent-light"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-on-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PokeSunshineTCG. All rights reserved.</p>
          <p>Authenticity first. Clear listings. Collector-conscious service.</p>
        </div>
      </div>
    </footer>
  )
}
