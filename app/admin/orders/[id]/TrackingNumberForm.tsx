'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
        className="border border-gray-300 px-3 py-1.5 rounded text-sm flex-1"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 text-sm font-medium rounded bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      {saved && <span className="text-sm text-green-600">Saved</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}