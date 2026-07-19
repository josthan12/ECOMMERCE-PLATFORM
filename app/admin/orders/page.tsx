import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus';
import { ClipboardList } from 'lucide-react';
import Button from '../../components/ui/Button';

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
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl mb-6">Orders</h1>

      <form method="GET" className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-text-muted">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={selectedStatus}
            className="min-h-[44px] rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
          <label htmlFor="sort" className="mb-1 block text-xs font-medium text-text-muted">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={selectedSort}
            className="min-h-[44px] rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="total_desc">Total: high to low</option>
            <option value="total_asc">Total: low to high</option>
          </select>
        </div>

        <Button type="submit" size="sm">
          Apply
        </Button>

        {(selectedStatus !== 'ALL' || selectedSort !== 'newest') && (
          <Link
            href="/admin/orders"
            className="pb-1.5 text-sm text-text-muted transition-colors hover:text-primary"
          >
            Clear filters
          </Link>
        )}
      </form>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <ClipboardList className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">
            {selectedStatus === 'ALL' ? 'No orders yet.' : `No orders with status "${formatStatus(selectedStatus)}".`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`border-b border-border-light transition-colors last:border-b-0 hover:bg-surface-hover ${
                      i % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      <Link href={`/admin/orders/${order.id}`} className="transition-colors hover:text-primary">
                        {order.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text">{order.user.name || order.user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-pill px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[order.status] ?? 'bg-surface-muted text-text'
                        }`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-primary">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
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
        </div>
      )}
    </div>
  );
}