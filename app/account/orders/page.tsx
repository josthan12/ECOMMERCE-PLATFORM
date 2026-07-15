import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus';

export default async function AccountOrdersPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect('/sign-in?redirect_url=/account/orders');
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    redirect('/sign-in?redirect_url=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-mono text-gray-500">{order.id.slice(0, 8)}…</p>
                <p className="text-sm text-gray-500">
                  {order.createdAt.toLocaleDateString('en-SG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formatStatus(order.status)}
                </span>
                <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}