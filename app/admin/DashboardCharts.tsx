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

// Hardcoded to mirror globals.css tokens — SVG fill/stroke attributes don't
// reliably resolve CSS custom properties across browsers, so these must
// stay in sync manually if the palette in globals.css ever changes.
const NAVY = '#14213D'
const GOLD = '#C6A15B'
const BURGUNDY = '#6E2439'
const GRID = '#F0EBE3'
const TICK = '#6B7280'
const PIE_COLORS = [NAVY, GOLD]

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-md)',
  fontSize: 13,
}
const legendStyle = { fontSize: 13, color: 'var(--color-text-muted)' }

export function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Line type="monotone" dataKey="revenue" stroke={NAVY} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function NewCustomersChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="newCustomers" fill={GOLD} radius={[4, 4, 0, 0]} />
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
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis type="number" tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: TICK }} width={120} axisLine={{ stroke: GRID }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Bar dataKey="revenue" fill={BURGUNDY} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PopularCategoriesChart({ data }: { data: CategorySlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: TICK }} axisLine={{ stroke: GRID }} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="orders" fill={GOLD} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}