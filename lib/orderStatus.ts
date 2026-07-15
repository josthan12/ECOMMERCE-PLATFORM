export const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PAYMENT_FAILED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  PACKED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-gray-200 text-gray-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
  REFUNDED: 'bg-orange-100 text-orange-800',
};

export function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}