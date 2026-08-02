import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidateStorefront } from '@/lib/revalidateStorefront'
import { NextResponse } from 'next/server'
import type { FieldType } from '@/app/generated/prisma/enums'
import { Prisma } from '@/app/generated/prisma/client'

type ProductFieldInput = {
  label: string
  key: string
  type: FieldType
  required: boolean
  options?: string
}

type ProductTypeInput = {
  name?: string
  description?: string
  fields?: ProductFieldInput[]
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const productTypes = await prisma.productType.findMany({
    include: { fields: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(productTypes)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, description, fields } = (await req.json()) as ProductTypeInput

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!Array.isArray(fields)) {
    return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const productType = await prisma.productType.create({
    data: {
      name,
      slug,
      description,
      fields: {
        create: fields.map((f, index) => ({
          label: f.label,
          key: f.key,
          type: f.type,
          required: f.required,
          options: f.options
            ? f.options.split(',').map((o: string) => o.trim())
            : Prisma.JsonNull,
          order: index,
        })),
      },
    },
    include: { fields: true },
  })

  revalidateStorefront()

  return NextResponse.json(productType)
}
