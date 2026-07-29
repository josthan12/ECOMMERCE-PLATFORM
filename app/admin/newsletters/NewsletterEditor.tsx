'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ImageIcon, Mail } from 'lucide-react'
import CatalogImage from '@/app/components/CatalogImage'
import Button from '@/app/components/ui/Button'

type NewsletterDraft = {
  id?: string
  topic: string
  subject: string
  previewText: string
  body: string
  imageUrl: string
}

type NewsletterEditorProps = {
  initialDraft?: NewsletterDraft
}

const inputClass =
  'min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent'

export default function NewsletterEditor({ initialDraft }: NewsletterEditorProps) {
  const router = useRouter()
  const [topic, setTopic] = useState(initialDraft?.topic ?? '')
  const [subject, setSubject] = useState(initialDraft?.subject ?? '')
  const [previewText, setPreviewText] = useState(initialDraft?.previewText ?? '')
  const [body, setBody] = useState(initialDraft?.body ?? '')
  const [imageUrl, setImageUrl] = useState(initialDraft?.imageUrl ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        initialDraft?.id
          ? `/api/admin/newsletters/${initialDraft.id}`
          : '/api/admin/newsletters',
        {
          method: initialDraft?.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, subject, previewText, body, imageUrl }),
        }
      )
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Unable to save the newsletter draft.')
        return
      }

      router.push('/admin/newsletters')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-text">
            Topic
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            maxLength={120}
            placeholder="e.g. August arrivals and shop updates"
            className={inputClass}
            required
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Used as the main heading inside the email.
          </p>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text">
            Email subject
          </label>
          <input
            id="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={200}
            placeholder="What customers will see in their inbox"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label
            htmlFor="previewText"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Inbox preview text <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="previewText"
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
            maxLength={240}
            placeholder="A short line shown beside the subject in many inboxes"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium text-text">
            Lead image <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            maxLength={2000}
            placeholder="/images/newsletters/update.jpg or https://..."
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Use a public image path or a secure hosted image URL.
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <label htmlFor="body" className="text-sm font-medium text-text">
              Newsletter text
            </label>
            <span className="text-xs text-text-muted">{body.length}/20,000</span>
          </div>
          <textarea
            id="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={20_000}
            rows={16}
            placeholder="Write the newsletter in your own voice. Leave a blank line between paragraphs."
            className="w-full rounded-md border border-border bg-surface px-3 py-3 text-sm leading-6 text-text placeholder:text-text-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-error" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save draft'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/newsletters')}>
            Cancel
          </Button>
        </div>
      </form>

      <aside className="self-start xl:sticky xl:top-8">
        <p className="mb-3 text-sm font-medium text-text">Email preview</p>
        <div className="overflow-hidden rounded-xl border border-border-light bg-[#FAF6EE] shadow-card">
          <div className="bg-[#14213D] px-6 py-5 text-[#C6A15B]">
            <p className="text-lg font-bold">PokeSunshineTCG</p>
          </div>

          {imageUrl && (
            <div className="relative aspect-[2/1] overflow-hidden bg-surface-muted">
              <CatalogImage
                src={imageUrl}
                alt=""
                sizes="520px"
                fit="cover"
              />
            </div>
          )}

          <div className="px-6 py-7">
            <h2 className="text-2xl font-semibold leading-tight text-[#14213D]">
              {topic || 'Your newsletter topic'}
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-6 whitespace-pre-line text-[#1F2126]">
              {body ? (
                body.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p className="text-[#6B7280]">Your newsletter text will appear here.</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF6EE] px-6 py-4 text-xs text-[#6B7280]">
            {imageUrl ? (
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            Customers can manage their newsletter preference from every email.
          </div>
        </div>
      </aside>
    </div>
  )
}
