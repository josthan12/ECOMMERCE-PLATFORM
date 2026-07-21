import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Ticket, Plus } from 'lucide-react'
import PromoCodeActions from './PromoCodeActions'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

function formatDiscount(type: string, value: number) {
  return type === 'PERCENTAGE' ? `${value}%` : `$${value.toFixed(2)}`
}

export default async function PromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Promo Codes</h1>
        <Link href="/admin/promo-codes/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Promo Code
          </Button>
        </Link>
      </div>

      {promoCodes.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <Ticket className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No promo codes yet.</p>
          <p className="mt-1 text-sm text-text-muted">Create one to offer a discount at checkout.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Discount</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Min Order</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Max Discount</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo, i) => (
                  <tr
                    key={promo.id}
                    className={`border-b border-border-light transition-colors last:border-b-0 hover:bg-surface-hover ${
                      i % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-4 py-4 font-mono font-medium text-text">{promo.code}</td>
                    <td className="px-4 py-4 text-text">{formatDiscount(promo.discountType, promo.discountValue)}</td>
                    <td className="px-4 py-4 text-text-muted">
                      {promo.minOrderValue != null ? `$${promo.minOrderValue.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {promo.maxDiscountAmount != null ? `$${promo.maxDiscountAmount.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-4">
                      {promo.usedAt ? (
                        <Badge variant="neutral">Used</Badge>
                      ) : promo.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/admin/promo-codes/${promo.id}/edit`}
                          className="text-primary transition-colors hover:text-accent"
                        >
                          Edit
                        </Link>
                        <PromoCodeActions promoId={promo.id} active={promo.active} used={!!promo.usedAt} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}