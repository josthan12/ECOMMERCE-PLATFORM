import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/adminApiAuth'
import { broadcastNewsletterPost } from '@/lib/email/sendNewsletter'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await params

  try {
    const result = await broadcastNewsletterPost(id)
    return NextResponse.json(result)
  } catch (caughtError) {
    await prisma.newsletterPost.updateMany({
      where: { id, status: 'SENDING' },
      data: { status: 'FAILED' },
    })

    const message =
      caughtError instanceof Error ? caughtError.message : 'Newsletter broadcast failed.'

    return NextResponse.json({ error: message }, { status: 409 })
  }
}
