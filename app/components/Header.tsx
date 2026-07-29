'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { Menu, PackageSearch, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/cn'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import Button from './ui/Button'

const SHOPPING_LINKS = [
  { label: 'Shop TCG', href: '/categories' },
  { label: 'New arrivals', href: '/#new-arrivals' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const hasMounted = useSyncExternalStore(subscribeToHydration, () => true, () => false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border-light bg-background/92 backdrop-blur-xl',
        'transition-shadow duration-[250ms] ease-out',
        isScrolled && 'shadow-card'
      )}
    >
      <div className="bg-ink text-on-ink">
        <div className="mx-auto flex min-h-8 max-w-[1440px] items-center justify-center px-4 text-center text-[11px] font-medium tracking-[0.12em] text-on-ink-muted uppercase md:px-8">
          Authentic TCG stock
          <span className="mx-2 text-accent" aria-hidden="true">
            /
          </span>
          Singapore delivery and free self-collection
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div
          className={cn(
            'flex items-center gap-3 transition-[padding] duration-[250ms] ease-out',
            isScrolled ? 'py-2.5' : 'py-3.5'
          )}
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="PokeSunshineTCG home"
          >
            <span className="header-brand-mark relative h-10 w-10 overflow-hidden rounded-full border border-accent/55 bg-surface shadow-input">
              <Image
                src="/images/brand/pokesunshine-logo.png"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-lg font-semibold leading-none tracking-[0.02em] text-primary">
                PokeSunshine<span className="text-accent">TCG</span>
              </span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.2em] text-text-muted uppercase">
                Trading Card Co.
              </span>
            </span>
          </Link>

          <nav
            className="ml-5 hidden items-center gap-6 lg:flex"
            aria-label="Primary navigation"
          >
            {SHOPPING_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden max-w-sm flex-1 xl:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1.5 xl:ml-2">
            <Link
              href="/account/orders"
              className="hidden min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover hover:text-primary md:inline-flex"
            >
              <PackageSearch className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="hidden 2xl:inline">My orders</span>
            </Link>

            <Link
              href="/cart"
              aria-label={
                hasMounted && totalItems > 0
                  ? `Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
                  : 'Cart'
              }
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-pill border px-3 py-2 text-sm font-medium',
                'transition-[background-color,border-color,color,box-shadow] duration-[250ms] ease-out',
                hasMounted && totalItems > 0
                  ? 'border-accent/60 bg-accent/10 text-primary shadow-input hover:bg-accent/15'
                  : 'border-transparent text-text hover:border-border hover:bg-surface-hover hover:text-primary'
              )}
            >
              <CartIcon className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {hasMounted && totalItems > 0 && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-pill bg-accent px-1.5 text-xs font-bold leading-none text-accent-foreground shadow-input ring-1 ring-accent-light/50"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <ThemeToggle />

            <div className="hidden sm:block">
              <Show when="signed-out">
                <SignInButton mode="redirect">
                  <Button variant="secondary" size="sm">
                    Sign in
                  </Button>
                </SignInButton>
              </Show>

              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface text-text transition-colors hover:border-accent hover:bg-surface-hover hover:text-primary lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-border-light py-2.5 xl:hidden">
          <SearchBar />
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-border-light bg-surface px-4 py-3 shadow-dropdown lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-[1440px] gap-1">
            {SHOPPING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-md px-3 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-hover hover:text-primary md:hidden"
            >
              My orders
            </Link>
            <div className="px-3 pb-1 pt-2 sm:hidden">
              <Show when="signed-out">
                <SignInButton mode="redirect">
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign in
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

function subscribeToHydration() {
  return () => {}
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative py-2 text-xs font-semibold tracking-[0.08em] text-text uppercase transition-colors hover:text-primary"
    >
      {children}
      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-[250ms] ease-out group-hover:scale-x-100" />
    </Link>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
