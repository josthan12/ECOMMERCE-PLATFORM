'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Show,
  SignInButton,
  UserButton,
} from '@clerk/nextjs'
import { useCartStore } from '@/lib/store/cart'

export default function Header() {
  const [hasMounted, setHasMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg">
        Store
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/account/orders">My Orders</Link>

        <Link href="/cart" className="relative flex items-center gap-1">
          <span>Cart</span>
          {hasMounted && totalItems > 0 && (
            <span className="bg-black text-white text-xs rounded-full px-2 py-0.5">
              {totalItems}
            </span>
          )}
        </Link>

        <Show when="signed-out">
          <SignInButton mode="redirect">
            <button className="text-sm font-medium">
              Sign In
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <UserButton/>
        </Show>
      </div>
    </header>
  )
}