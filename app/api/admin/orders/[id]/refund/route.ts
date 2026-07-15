import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Any order that was actually paid for, at any fulfillment stage, can be
// marked Refunded — the admin liaises with the customer directly (Telegram/
// email) and processes the actual refund manually via HitPay's dashboard or
// bank transfer. This route only records that fact; it never calls HitPay's
// API and never touches stock (stock is adjusted manually, case by case, per
// project decision).
const REFUNDABLE_STATUSES = new Set([
  'PAID',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
]);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!REFUNDABLE_STATUSES.has(order.status)) {
    return NextResponse.json(
      { error: `Order in status ${order.status} cannot be marked Refunded` },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: 'REFUNDED' },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}