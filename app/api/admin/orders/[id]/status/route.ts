import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { sendShippingNotificationEmail, sendReadyForCollectionEmail } from '@/lib/email/sendOrderEmail';

// Delivery orders go through the full carrier-style lifecycle.
// Self-collection orders skip Shipped/Delivered entirely — once packed,
// the next real-world event is the customer physically picking it up,
// which is recorded directly as Completed.
const DELIVERY_TRANSITIONS: Record<string, string> = {
  PAID: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: 'COMPLETED',
};

const SELF_COLLECTION_TRANSITIONS: Record<string, string> = {
  PAID: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'COMPLETED',
};

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

  const transitions =
    order.fulfillmentMethod === 'SELF_COLLECTION' ? SELF_COLLECTION_TRANSITIONS : DELIVERY_TRANSITIONS;

  const nextStatus = transitions[order.status];
  if (!nextStatus) {
    return NextResponse.json(
      { error: `Order in status ${order.status} cannot be advanced` },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: nextStatus as typeof order.status },
  });

  // Notification emails fire as separate statements after the DB write
  // resolves — never nested inside the update call (see Session 7).
  if (updated.fulfillmentMethod === 'DELIVERY' && updated.status === 'SHIPPED') {
    await sendShippingNotificationEmail(updated.id);
  }
  if (updated.fulfillmentMethod === 'SELF_COLLECTION' && updated.status === 'PACKED') {
    await sendReadyForCollectionEmail(updated.id);
  }

  return NextResponse.json({ id: updated.id, status: updated.status });
}