'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Show, SignInButton, UserButton } from '@clerk/nextjs'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/cn'
import SearchBar from './SearchBar'
import Button from './ui/Button'

export default function Header() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border-light bg-background/85 backdrop-blur-md',
        'transition-[padding,box-shadow] duration-[250ms] ease-out',
        isScrolled ? 'py-2 shadow-card' : 'py-4'
      )}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 md:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="shrink-0 font-display text-2xl font-semibold tracking-wide text-primary"
          >
            PokeSunshine<span className="text-accent">TCG</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <nav className="ml-auto flex flex-wrap items-center gap-5 text-sm font-medium text-text">
            <NavLink href="/account/orders">My Orders</NavLink>

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-text transition-colors hover:text-primary"
            >
              <CartIcon className="h-5 w-5" />
              <span>Cart</span>
              {hasMounted && totalItems > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-pill bg-accent px-1 text-xs font-semibold text-primary">
                  {totalItems}
                </span>
              )}
            </Link>

            <Show when="signed-out">
              <SignInButton mode="redirect">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <UserButton />
            </Show>
          </nav>
        </div>

        <div className="md:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group relative py-1">
      {children}
      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-[250ms] ease-out group-hover:scale-x-100" />
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