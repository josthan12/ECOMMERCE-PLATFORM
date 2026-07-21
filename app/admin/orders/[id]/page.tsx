import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { User, MapPin, CreditCard, Truck, ShoppingBag } from 'lucide-react';
import BackButton from '@/app/components/BackButton';
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus';
import { GST_ENABLED } from '@/lib/gst';
import OrderStatusActions from './OrderStatusActions';
import TrackingNumberForm from './TrackingNumberForm';

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
    <div className="max-w-4xl">
      <BackButton />

      <div className="mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary">
            Order <span className="font-mono text-xl text-text-muted">{order.id}</span>
          </h1>
          <p className="mt-1 text-sm text-text-muted">
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
            className={`inline-block rounded-pill px-3 py-1 text-sm font-medium ${
              STATUS_STYLES[order.status] ?? 'bg-surface-muted text-text'
            }`}
          >
            {formatStatus(order.status)}
          </span>
          <OrderStatusActions
            orderId={order.id}
            currentStatus={order.status}
            fulfillmentMethod={order.fulfillmentMethod}
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <div className="rounded-lg border border-border-light bg-surface p-4 shadow-card">
          <h2 className="mb-2 flex items-center gap-1.5 font-display text-base font-semibold text-primary">
            <User className="h-4 w-4 text-accent" aria-hidden="true" />
            Customer
          </h2>
          <p className="text-sm text-text">{order.user.name || '—'}</p>
          <p className="text-sm text-text-muted">{order.user.email}</p>
        </div>

        <div className="rounded-lg border border-border-light bg-surface p-4 shadow-card">
          <h2 className="mb-2 flex items-center gap-1.5 font-display text-base font-semibold text-primary">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {order.fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping Address'}
          </h2>
          {order.fulfillmentMethod === 'SELF_COLLECTION' ? (
            <p className="text-sm text-text-muted">Customer will collect this order in person.</p>
          ) : (
            <>
              <p className="text-sm text-text">
                Block {order.shippingBlock}
                {order.shippingUnitNumber ? `, ${order.shippingUnitNumber}` : ''}
              </p>
              <p className="text-sm text-text">{order.shippingStreet}</p>
              <p className="text-sm text-text">Singapore {order.shippingPostalCode}</p>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-border-light bg-surface p-4 shadow-card">
        <h2 className="mb-2 flex items-center gap-1.5 font-display text-base font-semibold text-primary">
          <CreditCard className="h-4 w-4 text-accent" aria-hidden="true" />
          Payment
        </h2>
        <p className="text-sm text-text-muted">
          HitPay Payment Request ID:{' '}
          <span className="font-mono text-text">{order.hitpayPaymentRequestId || '—'}</span>
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-border-light bg-surface p-4 shadow-card">
        <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-semibold text-primary">
          <Truck className="h-4 w-4 text-accent" aria-hidden="true" />
          Tracking Number
        </h2>
        <TrackingNumberForm orderId={order.id} initialTrackingNumber={order.trackingNumber} />
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
        <div className="flex items-center gap-1.5 border-b border-border-light bg-surface-muted px-4 py-3">
          <ShoppingBag className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold text-primary">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border-light bg-surface-muted">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Product</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">Variant</th>
                <th className="px-4 py-2 text-left font-medium text-text-muted">SKU</th>
                <th className="px-4 py-2 text-right font-medium text-text-muted">Qty</th>
                <th className="px-4 py-2 text-right font-medium text-text-muted">Price</th>
                <th className="px-4 py-2 text-right font-medium text-text-muted">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-border-light last:border-b-0 ${
                    i % 2 === 1 ? 'bg-surface-muted/40' : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-text">{item.productName}</td>
                  <td className="px-4 py-2.5 text-text-muted">{formatCombination(item.combination)}</td>
                  <td className="px-4 py-2.5 text-text-muted">{item.sku || '—'}</td>
                  <td className="px-4 py-2.5 text-right text-text">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-text">${item.price.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-text">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ml-auto max-w-xs rounded-lg border border-border-light bg-surface p-4 shadow-card">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span className="text-text">${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-text-muted">
              Discount{order.promoCode ? ` (${order.promoCode})` : ''}
            </span>
            <span className="text-success">-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-text-muted">
            {order.fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping'}
          </span>
          <span className="text-text">${order.shippingFee.toFixed(2)}</span>
        </div>
        {GST_ENABLED && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-text-muted">GST</span>
            <span className="text-text">${order.gstAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-border-light pt-2 font-semibold">
          <span className="text-primary">Total</span>
          <span className="text-primary">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}