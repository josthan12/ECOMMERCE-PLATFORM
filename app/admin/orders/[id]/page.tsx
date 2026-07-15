import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import BackButton from '@/app/components/BackButton';
import OrderStatusActions from './OrderStatusActions';
import TrackingNumberForm from './TrackingNumberForm';

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-200 text-gray-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
  REFUNDED: 'bg-orange-100 text-orange-800',
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCombination(combination: unknown): string {
  if (!combination || typeof combination !== 'object' || Array.isArray(combination)) {
    return '—';
  }
  return Object.entries(combination as Record<string, unknown>)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl">
      <BackButton />

      <div className="flex items-center justify-between mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.id}</h1>
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
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-block px-3 py-1 rounded text-sm font-medium ${
              STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {formatStatus(order.status)}
          </span>
          <OrderStatusActions orderId={order.id} currentStatus={order.status} fulfillmentMethod={order.fulfillmentMethod} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-medium text-gray-700 mb-2">Customer</h2>
          <p className="text-sm">{order.user.name || '—'}</p>
          <p className="text-sm text-gray-500">{order.user.email}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-medium text-gray-700 mb-2">
            {order.fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping Address'}
          </h2>
          {order.fulfillmentMethod === 'SELF_COLLECTION' ? (
            <p className="text-sm text-gray-500">Customer will collect this order in person.</p>
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
      </div>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-medium text-gray-700 mb-2">Payment</h2>
        <p className="text-sm text-gray-500">
          HitPay Payment Request ID:{' '}
          <span className="font-mono">{order.hitpayPaymentRequestId || '—'}</span>
        </p>
      </div>

      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-medium text-gray-700 mb-2">Tracking Number</h2>
        <TrackingNumberForm orderId={order.id} initialTrackingNumber={order.trackingNumber} />
      </div>

      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Variant</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">SKU</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Price</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-4 py-2">{item.productName}</td>
                <td className="px-4 py-2 text-gray-500">
                  {formatCombination(item.combination)}
                </td>
                <td className="px-4 py-2 text-gray-500">{item.sku || '—'}</td>
                <td className="px-4 py-2 text-right">{item.quantity}</td>
                <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
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