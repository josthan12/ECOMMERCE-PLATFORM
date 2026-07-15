import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus';

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PAYMENT_FAILED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
];

const SORT_OPTIONS: Record<string, { createdAt?: 'asc' | 'desc'; total?: 'asc' | 'desc' }> = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  total_desc: { total: 'desc' },
  total_asc: { total: 'asc' },
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const { status, sort } = await searchParams;

  const selectedStatus = status && ORDER_STATUSES.includes(status) ? status : 'ALL';
  const selectedSort = sort && SORT_OPTIONS[sort] ? sort : 'newest';

  const orders = await prisma.order.findMany({
    where: selectedStatus === 'ALL' ? {} : { status: selectedStatus as never },
    orderBy: SORT_OPTIONS[selectedSort],
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      <form method="GET" className="flex items-end gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            name="status"
            defaultValue={selectedStatus}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatStatus(s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sort</label>
          <select
            name="sort"
            defaultValue={selectedSort}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="total_desc">Total: high to low</option>
            <option value="total_asc">Total: low to high</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-1.5 text-sm font-medium rounded bg-gray-900 text-white hover:bg-gray-700"
        >
          Apply
        </button>

        {(selectedStatus !== 'ALL' || selectedSort !== 'newest') && (
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:underline pb-1.5"
          >
            Clear filters
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="text-gray-500">
          {selectedStatus === 'ALL' ? 'No orders yet.' : `No orders with status "${formatStatus(selectedStatus)}".`}
        </p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Order ID</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {order.user.name || order.user.email}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {order.createdAt.toLocaleDateString('en-SG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}