'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';

export default function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg">
        Store
      </Link>
      <Link href="/cart" className="relative flex items-center gap-1">
        <span>Cart</span>
        {totalItems > 0 && (
          <span className="bg-black text-white text-xs rounded-full px-2 py-0.5">
            {totalItems}
          </span>
        )}
      </Link>
    </header>
  );
}