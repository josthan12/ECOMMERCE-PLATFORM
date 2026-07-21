'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Tags,
  Package,
  FolderTree,
  ClipboardList,
  Receipt,
  Ticket,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/product-types', label: 'Product Types', icon: Tags },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/expenses', label: 'Expenses', icon: Receipt },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1 p-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out',
              isActive
                ? 'bg-white/10 text-text-inverse'
                : 'text-text-inverse/70 hover:bg-white/5 hover:text-text-inverse'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}