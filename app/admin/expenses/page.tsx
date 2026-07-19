import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Receipt, Plus } from 'lucide-react'
import ExpenseActions from './ExpenseActions'
import Button from '../../components/ui/Button'

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { incurredAt: 'desc' },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Expenses</h1>
        <Link href="/admin/expenses/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Expense
          </Button>
        </Link>
      </div>

      <p className="mb-4 text-sm text-text-muted">
        Total logged: <span className="font-semibold text-primary">${total.toFixed(2)}</span>
      </p>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <Receipt className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No expenses logged yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Category</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Amount</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className={`border-b border-border-light transition-colors last:border-b-0 hover:bg-surface-hover ${
                      i % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(expense.incurredAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text">{expense.title}</td>
                    <td className="px-4 py-3 text-text-muted">{expense.category}</td>
                    <td className="px-4 py-3 text-right text-text">${expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-4">
                        <Link
                          href={`/admin/expenses/${expense.id}/edit`}
                          className="text-primary transition-colors hover:text-accent"
                        >
                          Edit
                        </Link>
                        <ExpenseActions expenseId={expense.id} />
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