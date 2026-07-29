'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Trash2 } from 'lucide-react'

type NewsletterActionsProps = {
  postId: string
  topic: string
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED'
  subscriberCount: number
  failureCount: number
}

export default function NewsletterActions({
  postId,
  topic,
  status,
  subscriberCount,
  failureCount,
}: NewsletterActionsProps) {
  const router = useRouter()
  const [working, setWorking] = useState<'broadcast' | 'delete' | null>(null)

  async function handleBroadcast() {
    const confirmation =
      status === 'FAILED'
        ? `Retry ${failureCount} failed ${
            failureCount === 1 ? 'delivery' : 'deliveries'
          } for “${topic}”? Successful deliveries will not be resent.`
        : `Broadcast “${topic}” to ${subscriberCount} subscribed ${
            subscriberCount === 1 ? 'customer' : 'customers'
          }? Sending cannot be undone.`

    if (!window.confirm(confirmation)) {
      return
    }

    setWorking('broadcast')
    try {
      const response = await fetch(`/api/admin/newsletters/${postId}/broadcast`, {
        method: 'POST',
      })
      const result = await response.json()

      if (!response.ok) {
        window.alert(result.error || 'Newsletter broadcast failed.')
      } else {
        window.alert(
          `Broadcast complete: ${result.successCount} sent, ${result.skippedCount} skipped, ${result.failureCount} failed.`
        )
      }
      router.refresh()
    } catch {
      window.alert('Network error. Please try again.')
    } finally {
      setWorking(null)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the draft “${topic}”? This cannot be undone.`)) return

    setWorking('delete')
    try {
      const response = await fetch(`/api/admin/newsletters/${postId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (!response.ok) {
        window.alert(result.error || 'Unable to delete the draft.')
      }
      router.refresh()
    } catch {
      window.alert('Network error. Please try again.')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="flex justify-end gap-4">
      {(status === 'DRAFT' || status === 'FAILED') && (
        <button
          type="button"
          onClick={handleBroadcast}
          disabled={
            working !== null ||
            (status === 'DRAFT' ? subscriberCount === 0 : failureCount === 0)
          }
          className="inline-flex items-center gap-1.5 font-medium text-primary transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          {working === 'broadcast'
            ? 'Sending…'
            : status === 'FAILED'
              ? 'Retry'
              : 'Broadcast'}
        </button>
      )}
      {status === 'DRAFT' && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={working !== null}
          className="inline-flex items-center gap-1.5 text-error transition-colors hover:text-error/80 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {working === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
      )}
    </div>
  )
}
