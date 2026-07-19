import Link from 'next/link'
import {
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  CheckCircle2,
  Package,
  AlertTriangle,
  Repeat,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@/app/generated/prisma/client'
import { totalStock } from '../components/ProductCard'
import { STATUS_STYLES, formatStatus } from '@/lib/orderStatus'
import MetricCard from '../components/ui/MetricCard'
import {
  RevenueTrendChart,
  NewCustomersChart,
  FulfillmentSplitChart,
  TopProductsChart,
} from './DashboardCharts'

const ALL_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'PROCESSING', 'PACKED',
  'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED',
]
const REVENUE_STATUSES: OrderStatus[] = ['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED']

function monthKey(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default async function AdminDashboard() {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
  twelveMonthsAgo.setDate(1)
  twelveMonthsAgo.setHours(0, 0, 0, 0)

  const [
    statusCounts, revenueAgg, activeProducts, recentOrders, expenses,
    revenueOrders, allUsers, allCustomerOrders, orderItemsWithProduct,
  ] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: { in: REVENUE_STATUSES } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.product.findMany({ where: { archived: false }, include: { variants: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.expense.findMany(),
    prisma.order.findMany({
      where: { status: { in: REVENUE_STATUSES }, createdAt: { gte: twelveMonthsAgo } },
      select: { total: true, createdAt: true, fulfillmentMethod: true },
    }),
    prisma.user.findMany({ select: { id: true, createdAt: true } }),
    prisma.order.findMany({ select: { userId: true } }),
    prisma.orderItem.findMany({
      where: { order: { status: { in: REVENUE_STATUSES } } },
      select: { productName: true, price: true, quantity: true },
    }),
  ])

  const countsByStatus = new Map(statusCounts.map((s) => [s.status, s._count._all]))
  const totalRevenue = revenueAgg._sum.total ?? 0
  const paidOrderCount = revenueAgg._count._all
  const outOfStockCount = activeProducts.filter((p) => totalStock(p.variants) === 0).length
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const profit = totalRevenue - totalExpenses
  const averageOrderValue = paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0

  const monthBuckets = new Map<string, { revenue: number; newCustomers: number }>()
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo)
    d.setMonth(d.getMonth() + i)
    monthBuckets.set(monthKey(d), { revenue: 0, newCustomers: 0 })
  }
  for (const order of revenueOrders) {
    const bucket = monthBuckets.get(monthKey(new Date(order.createdAt)))
    if (bucket) bucket.revenue += order.total
  }
  for (const user of allUsers) {
    if (new Date(user.createdAt) < twelveMonthsAgo) continue
    const bucket = monthBuckets.get(monthKey(new Date(user.createdAt)))
    if (bucket) bucket.newCustomers += 1
  }
  const revenueTrendData = Array.from(monthBuckets.entries()).map(([month, v]) => ({ month, ...v }))

  const deliveryCount = revenueOrders.filter((o) => o.fulfillmentMethod === 'DELIVERY').length
  const selfCollectionCount = revenueOrders.filter((o) => o.fulfillmentMethod === 'SELF_COLLECTION').length
  const fulfillmentData = [
    { name: 'Delivery', value: deliveryCount },
    { name: 'Self Collection', value: selfCollectionCount },
  ]

  const productRevenueMap = new Map<string, number>()
  for (const item of orderItemsWithProduct) {
    productRevenueMap.set(item.productName, (productRevenueMap.get(item.productName) ?? 0) + item.price * item.quantity)
  }
  const topProductsData = Array.from(productRevenueMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const ordersByUser = new Map<string, number>()
  for (const o of allCustomerOrders) {
    ordersByUser.set(o.userId, (ordersByUser.get(o.userId) ?? 0) + 1)
  }
  const customersWithOrders = ordersByUser.size
  const repeatCustomers = Array.from(ordersByUser.values()).filter((c) => c > 1).length
  const repeatCustomerRate = customersWithOrders > 0 ? (repeatCustomers / customersWithOrders) * 100 : 0

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <MetricCard label="Total Expenses" value={`$${totalExpenses.toFixed(2)}`} icon={Receipt} />
        <MetricCard
          label="Profit"
          value={`$${profit.toFixed(2)}`}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          tone={profit >= 0 ? 'success' : 'error'}
        />
        <MetricCard label="Avg Order Value" value={`$${averageOrderValue.toFixed(2)}`} icon={ShoppingBag} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Paid Orders" value={String(paidOrderCount)} icon={CheckCircle2} />
        <MetricCard label="Active Products" value={String(activeProducts.length)} icon={Package} />
        <MetricCard label="Out of Stock" value={String(outOfStockCount)} icon={AlertTriangle} />
        <MetricCard label="Repeat Customer Rate" value={`${repeatCustomerRate.toFixed(0)}%`} icon={Repeat} />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Revenue (last 12 months)</h2>
          <div className="mt-3">
            <RevenueTrendChart data={revenueTrendData} />
          </div>
        </div>
        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">New Customers (last 12 months)</h2>
          <div className="mt-3">
            <NewCustomersChart data={revenueTrendData} />
          </div>
        </div>
        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Delivery vs Self Collection</h2>
          <div className="mt-3">
            <FulfillmentSplitChart data={fulfillmentData} />
          </div>
        </div>
        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Top 5 Products by Revenue</h2>
          <div className="mt-3">
            {topProductsData.length > 0 ? (
              <TopProductsChart data={topProductsData} />
            ) : (
              <p className="text-sm text-text-muted">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Orders by Status</h2>
          <div className="mt-3 flex flex-col gap-1">
            {ALL_STATUSES.map((status) => (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="-mx-2 flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-surface-hover"
              >
                <span className={`rounded-pill px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-surface-muted text-text'}`}>
                  {formatStatus(status)}
                </span>
                <span className="text-sm text-text-muted">{countsByStatus.get(status) ?? 0}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-primary">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">No orders yet.</p>
          ) : (
            <div className="mt-3 flex flex-col">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="-mx-2 flex items-center justify-between rounded-md border-b border-border-light px-2 py-2.5 transition-colors last:border-b-0 hover:bg-surface-hover"
                >
                  <div>
                    <p className="text-sm text-text">{order.user.name || order.user.email}</p>
                    <span className={`rounded-pill px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-surface-muted text-text'}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary">${order.total.toFixed(2)}</span>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/admin/orders"
            className="mt-3 block text-center text-sm text-primary transition-colors hover:text-accent"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  )
}