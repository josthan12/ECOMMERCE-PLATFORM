import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/adminApiAuth'
import { parseNewsletterPostInput } from '@/lib/newsletterPosts'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error } = await requireAdminApi()
  if (error) return error

  const posts = await prisma.newsletterPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const { error } = await requireAdminApi()
  if (error) return error

  const parsed = parseNewsletterPostInput(await request.json())
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const post = await prisma.newsletterPost.create({ data: parsed.data })
  return NextResponse.json(post, { status: 201 })
}
