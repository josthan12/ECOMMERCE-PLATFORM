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

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const expenses = await prisma.expense.findMany({
    orderBy: { incurredAt: 'desc' },
  })
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const { title, category, amount, incurredAt, notes } = body

  if (!title || !category || amount === undefined || amount === null) {
    return NextResponse.json({ error: 'title, category, and amount are required' }, { status: 400 })
  }

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: 'amount must be a valid non-negative number' }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      category,
      amount: parsedAmount,
      incurredAt: incurredAt ? new Date(incurredAt) : new Date(),
      notes: notes || null,
    },
  })

  return NextResponse.json(expense, { status: 201 })
}