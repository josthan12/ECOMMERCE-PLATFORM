import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ExpenseActions from './ExpenseActions'

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { incurredAt: 'desc' },
  })

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <Link
          href="/admin/expenses/new"
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800"
        >
          + Add Expense
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Total logged: <span className="font-semibold text-gray-800">${total.toFixed(2)}</span>
      </p>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No expenses logged yet.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(expense.incurredAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{expense.title}</td>
                  <td className="px-4 py-2 text-gray-600">{expense.category}</td>
                  <td className="px-4 py-2 text-right text-gray-800">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/expenses/${expense.id}/edit`}
                        className="text-blue-600 hover:underline"
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
      )}
    </div>
  )
}