'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatStatus } from '@/lib/orderStatus';
import { cn } from '@/lib/cn';
import Button from '../../../components/ui/Button';

const DELIVERY_TRANSITIONS: Record<string, string> = {
  PAID: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
  DELIVERED: 'COMPLETED',
};

const SELF_COLLECTION_TRANSITIONS: Record<string, string> = {
  PAID: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'COMPLETED',
};

const REFUNDABLE_STATUSES = new Set([
  'PAID',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
]);

export default function OrderStatusActions({
  orderId,
  currentStatus,
  fulfillmentMethod,
}: {
  orderId: string;
  currentStatus: string;
  fulfillmentMethod: string;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<'advance' | 'refund' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transitions = fulfillmentMethod === 'SELF_COLLECTION' ? SELF_COLLECTION_TRANSITIONS : DELIVERY_TRANSITIONS;
  const nextStatus = transitions[currentStatus];
  const canRefund = REFUNDABLE_STATUSES.has(currentStatus);

  if (!nextStatus && !canRefund) {
    return null;
  }

  async function callStatusRoute(path: 'status' | 'refund', action: 'advance' | 'refund') {
    setLoadingAction(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/${path}`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update status');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingAction(null);
    }
  }

  function handleAdvance() {
    callStatusRoute('status', 'advance');
  }

  function handleRefund() {
    const confirmed = window.confirm(
      'Mark this order as Refunded? This only records that you have already refunded the customer manually — it does not process any payment or restore stock.'
    );
    if (confirmed) {
      callStatusRoute('refund', 'refund');
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        {nextStatus && (
          <Button size="sm" onClick={handleAdvance} disabled={loadingAction !== null} className="gap-1.5">
            {loadingAction === 'advance' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {loadingAction === 'advance' ? 'Updating…' : `Mark as ${formatStatus(nextStatus)}`}
          </Button>
        )}
        {canRefund && (
          <button
            onClick={handleRefund}
            disabled={loadingAction !== null}
            className={cn(
              'rounded-md border border-error px-3 py-1.5 text-sm font-medium text-error transition-colors',
              'hover:bg-error/10 disabled:opacity-50'
            )}
          >
            {loadingAction === 'refund' ? 'Updating…' : 'Mark as Refunded'}
          </button>
        )}
      </div>
      {error && (
        <span className="flex items-center gap-1.5 text-sm text-error">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}