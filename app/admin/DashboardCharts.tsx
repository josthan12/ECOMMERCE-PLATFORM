'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

type RevenuePoint = { month: string; revenue: number; newCustomers: number }
type FulfillmentSlice = { name: string; value: number }
type TopProduct = { name: string; revenue: number }
type CategorySlice = { name: string; orders: number }

// SVG presentation attributes resolve these tokens at render time, so charts
// follow the existing data-theme switch without additional client state.
const CHART_PRIMARY = 'var(--color-chart-primary)'
const CHART_ACCENT = 'var(--color-chart-accent)'
const CHART_SECONDARY = 'var(--color-chart-secondary)'
const CHART_GRID = 'var(--color-chart-grid)'
const CHART_TICK = 'var(--color-chart-tick)'
const PIE_COLORS = [CHART_PRIMARY, CHART_ACCENT]

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
  fontSize: 13,
}
const legendStyle = { fontSize: 13, color: 'var(--color-text-muted)' }

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Line type="monotone" dataKey="revenue" stroke={CHART_PRIMARY} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function NewCustomersChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="newCustomers" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function FulfillmentSplitChart({ data }: { data: FulfillmentSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={legendStyle}
          formatter={(value) => (
            <span style={{ color: 'var(--color-text-muted)' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis type="number" tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: CHART_TICK }} width={120} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Bar dataKey="revenue" fill={CHART_SECONDARY} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PopularCategoriesChart({ data }: { data: CategorySlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: CHART_TICK }} axisLine={{ stroke: CHART_GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="orders" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
