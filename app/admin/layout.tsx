import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminNav from './AdminNav'

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
      <aside className="flex w-64 flex-col bg-primary text-text-inverse">
        <div className="border-b border-white/10 p-6">
          <h1 className="font-display text-xl font-semibold">
            Admin<span className="text-accent">Panel</span>
          </h1>
        </div>
        <AdminNav />
      </aside>

      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  )
}