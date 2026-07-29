import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      newsletterSubscribed: true,
    },
  })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ subscribed: user.newsletterSubscribed })
}

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.newsletterSubscribed) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        newsletterSubscribed: true,
        newsletterSubscribedAt: new Date(),
        newsletterUnsubscribedAt: null,
      },
    })
  }

  return NextResponse.json({ subscribed: true })
}

export async function DELETE() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.newsletterSubscribed) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        newsletterSubscribed: false,
        newsletterUnsubscribedAt: new Date(),
      },
    })
  }

  return NextResponse.json({ subscribed: false })
}
