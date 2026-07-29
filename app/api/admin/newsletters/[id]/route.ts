import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/adminApiAuth'
import { parseNewsletterPostInput } from '@/lib/newsletterPosts'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await params
  const post = await prisma.newsletterPost.findUnique({
    where: { id },
    include: {
      _count: { select: { deliveries: true } },
    },
  })

  if (!post) {
    return NextResponse.json({ error: 'Newsletter post not found.' }, { status: 404 })
  }

  return NextResponse.json(post)
}

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await params
  const existing = await prisma.newsletterPost.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Newsletter post not found.' }, { status: 404 })
  }
  if (existing.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Only draft newsletters can be edited.' },
      { status: 409 }
    )
  }

  const parsed = parseNewsletterPostInput(await request.json())
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const post = await prisma.newsletterPost.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(post)
}

export async function DELETE(_request: Request, { params }: Params) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await params
  const existing = await prisma.newsletterPost.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Newsletter post not found.' }, { status: 404 })
  }
  if (existing.status !== 'DRAFT') {
    return NextResponse.json(
      { error: 'Only draft newsletters can be deleted.' },
      { status: 409 }
    )
  }

  await prisma.newsletterPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
