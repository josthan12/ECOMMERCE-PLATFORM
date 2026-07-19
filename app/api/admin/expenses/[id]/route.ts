import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const { userId } = await auth()
  if (!userId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user }
}

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

  return NextResponse.json(expense)
}

export async function PUT(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

  const body = await request.json()
  const { title, category, amount, incurredAt, notes } = body

  if (!title || !category || amount === undefined || amount === null) {
    return NextResponse.json({ error: 'title, category, and amount are required' }, { status: 400 })
  }

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: 'amount must be a valid non-negative number' }, { status: 400 })
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      title,
      category,
      amount: parsedAmount,
      incurredAt: incurredAt ? new Date(incurredAt) : existing.incurredAt,
      notes: notes || null,
    },
  })

  return NextResponse.json(expense)
}

export async function DELETE(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const existing = await prisma.expense.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Expense not found' }, { status: 404 })

  await prisma.expense.delete({ where: { id } })

  return NextResponse.json({ success: true })
}