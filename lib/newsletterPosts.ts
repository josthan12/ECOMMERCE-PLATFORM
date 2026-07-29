export type NewsletterPostInput = {
  topic: string
  subject: string
  previewText: string | null
  body: string
  imageUrl: string | null
}

export function parseNewsletterPostInput(
  input: unknown
): { data: NewsletterPostInput; error?: never } | { data?: never; error: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid newsletter data.' }
  }

  const record = input as Record<string, unknown>
  const topic = cleanString(record.topic)
  const subject = cleanString(record.subject)
  const previewText = cleanString(record.previewText)
  const body = cleanString(record.body)
  const imageUrl = cleanString(record.imageUrl)

  if (!topic) return { error: 'Topic is required.' }
  if (!subject) return { error: 'Email subject is required.' }
  if (!body) return { error: 'Newsletter text is required.' }
  if (topic.length > 120) return { error: 'Topic must be 120 characters or fewer.' }
  if (subject.length > 200) return { error: 'Email subject must be 200 characters or fewer.' }
  if (previewText.length > 240) {
    return { error: 'Preview text must be 240 characters or fewer.' }
  }
  if (body.length > 20_000) {
    return { error: 'Newsletter text must be 20,000 characters or fewer.' }
  }
  if (imageUrl.length > 2_000) return { error: 'Image path is too long.' }
  if (imageUrl && !isAllowedNewsletterImage(imageUrl)) {
    return {
      error:
        'Use a local image path beginning with /images/ or a secure https:// image URL.',
    }
  }

  return {
    data: {
      topic,
      subject,
      previewText: previewText || null,
      body,
      imageUrl: imageUrl || null,
    },
  }
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isAllowedNewsletterImage(value: string) {
  if (value.startsWith('/images/') && !value.includes('..')) return true

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
