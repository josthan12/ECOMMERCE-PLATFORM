'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function TrackingNumberForm({
  orderId,
  initialTrackingNumber,
}: {
  orderId: string;
  initialTrackingNumber: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialTrackingNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save tracking number');
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Tracking number (optional)"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className="min-h-[44px] flex-1 rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
      {saved && (
        <span className="flex items-center gap-1 text-sm text-success">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Saved
        </span>
      )}
      {error && (
        <span className="flex items-center gap-1 text-sm text-error">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}