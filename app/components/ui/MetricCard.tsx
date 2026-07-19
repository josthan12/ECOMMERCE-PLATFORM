import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'success' | 'error'
}

export default function MetricCard({ label, value, icon: Icon, tone = 'default' }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border-light bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <Icon className="h-4 w-4 text-text-light" aria-hidden="true" />
      </div>
      <p
        className={cn(
          'mt-2 font-display text-2xl font-semibold',
          tone === 'success' && 'text-success',
          tone === 'error' && 'text-error',
          tone === 'default' && 'text-primary'
        )}
      >
        {value}
      </p>
    </div>
  )
}