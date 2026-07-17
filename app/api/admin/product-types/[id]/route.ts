import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params

  const productType = await prisma.productType.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  if (!productType) {
    return NextResponse.json({ error: 'Product type not found' }, { status: 404 })
  }

  return NextResponse.json(productType)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAdmin()
  if (authResult.error) return authResult.error

  const { id } = await params
  const { name, description, fields } = await req.json()

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!Array.isArray(fields)) {
    return NextResponse.json({ error: 'Fields must be an array' }, { status: 400 })
  }

  const existingType = await prisma.productType.findUnique({
    where: { id },
    include: { fields: true },
  })
  if (!existingType) {
    return NextResponse.json({ error: 'Product type not found' }, { status: 404 })
  }

  const existingFieldsById = new Map(existingType.fields.map((f) => [f.id, f]))

  const submittedIds = fields.filter((f: any) => f.id).map((f: any) => f.id)
  const idsToDelete = existingType.fields
    .map((f) => f.id)
    .filter((existingId) => !submittedIds.includes(existingId))

  // Guard: block removing any field that still holds real data on an
  // existing product of this type. "In use" means the key is present with a
  // non-empty value — this correctly counts a BOOLEAN field set to `false`
  // as in-use too, since false !== ''.
  if (idsToDelete.length > 0) {
    const products = await prisma.product.findMany({
      where: { productTypeId: id },
      select: { attributes: true },
    })

    const blocked: string[] = []
    for (const fieldId of idsToDelete) {
      const field = existingFieldsById.get(fieldId)!
      const inUseCount = products.filter((p) => {
        const val = (p.attributes as Record<string, any> | null)?.[field.key]
        return val !== undefined && val !== null && val !== ''
      }).length
      if (inUseCount > 0) {
        blocked.push(`"${field.label}" (${inUseCount} product${inUseCount === 1 ? '' : 's'})`)
      }
    }

    if (blocked.length > 0) {
      return NextResponse.json(
        { error: `Cannot remove field(s) still in use: ${blocked.join(', ')}` },
        { status: 400 }
      )
    }
  }

  const toUpdate = fields.filter((f: any) => f.id)
  const toCreate = fields.filter((f: any) => !f.id)

  // Duplicate-key guard across the final field set (existing kept fields +
  // any newly added ones) — two fields sharing a key would silently collide
  // in the attributes JSON.
  const finalKeys = [
    ...toUpdate.map((f: any) => existingFieldsById.get(f.id)!.key),
    ...toCreate.map((f: any) => f.key),
  ]
  const duplicates = finalKeys.filter((k, i) => finalKeys.indexOf(k) !== i)
  if (duplicates.length > 0) {
    return NextResponse.json(
      { error: `Duplicate field key(s): ${[...new Set(duplicates)].join(', ')}` },
      { status: 400 }
    )
  }

  const productType = await prisma.$transaction(async (tx) => {
    await tx.productType.update({
      where: { id },
      data: { name, description },
    })

    if (idsToDelete.length > 0) {
      await tx.productField.deleteMany({ where: { id: { in: idsToDelete } } })
    }

    for (let i = 0; i < fields.length; i++) {
      const f = fields[i]
      const options = f.options
        ? f.options.split(',').map((o: string) => o.trim())
        : null

      if (f.id) {
        // key and type are intentionally NOT taken from the client here —
        // always re-derived from the original stored field, even though the
        // edit UI already disables those inputs.
        const original = existingFieldsById.get(f.id)!
        await tx.productField.update({
          where: { id: f.id },
          data: {
            label: f.label,
            key: original.key,
            type: original.type,
            required: f.required,
            options,
            order: i,
          },
        })
      } else {
        await tx.productField.create({
          data: {
            productTypeId: id,
            label: f.label,
            key: f.key,
            type: f.type,
            required: f.required,
            options,
            order: i,
          },
        })
      }
    }

    return tx.productType.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } } },
    })
  })

  return NextResponse.json(productType)
}