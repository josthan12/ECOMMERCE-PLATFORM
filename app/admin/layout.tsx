import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          
        <a href="/admin"className="block px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Dashboard
          </a>
          
            <a href="/admin/product-types"
            className="block px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Product Types
          </a>
          
            <a href="/admin/products"
            className="block px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Products
          </a>
          
            <a href="/admin/categories"
            className="block px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Categories
          </a>
          
            <a href="/admin/orders"
            className="block px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            Orders
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-8">
        {children}
      </main>
    </div>
  )
}