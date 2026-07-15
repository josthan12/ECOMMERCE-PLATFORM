import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus';
import BackButton from '@/app/components/BackButton';
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants';

function formatCombination(combination: unknown): string {
  if (!combination || typeof combination !== 'object' || Array.isArray(combination)) {
    return '—';
  }
  return Object.entries(combination as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect('/sign-in?redirect_url=/account/orders');
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    redirect('/sign-in?redirect_url=/account/orders');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  // Not found OR belongs to someone else — same response either way,
  // so we don't leak whether an order ID exists to a non-owning user.
  if (!order || order.userId !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <BackButton />

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold">Order {order.id}</h1>
          <p className="text-sm text-gray-500">
            Placed{' '}
            {order.createdAt.toLocaleString('en-SG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
          }`}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-medium text-gray-700 mb-2">
          {order.fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping Address'}
        </h2>
        {order.fulfillmentMethod === 'SELF_COLLECTION' ? (
          <p className="text-sm text-gray-600">Pickup location: {SELF_COLLECTION_ADDRESS}</p>
        ) : (
          <>
            <p className="text-sm">
              Block {order.shippingBlock}
              {order.shippingUnitNumber ? `, ${order.shippingUnitNumber}` : ''}
            </p>
            <p className="text-sm">{order.shippingStreet}</p>
            <p className="text-sm">Singapore {order.shippingPostalCode}</p>
          </>
        )}
      </div>

      {order.trackingNumber && (
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-medium text-gray-700 mb-2">Tracking Number</h2>
          <p className="text-sm font-mono">{order.trackingNumber}</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Variant</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-2">{item.productName}</td>
                <td className="px-4 py-2 text-gray-500">{formatCombination(item.combination)}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border rounded-lg p-4 ml-auto max-w-xs">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">
            {order.fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping'}
          </span>
          <span>${order.shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">GST</span>
          <span>${order.gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium border-t pt-1 mt-1">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}