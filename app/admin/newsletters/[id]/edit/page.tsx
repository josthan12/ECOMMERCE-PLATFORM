import { notFound } from 'next/navigation'
import { Mail } from 'lucide-react'
import NewsletterEditor from '../../NewsletterEditor'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ id: string }> }

export default async function EditNewsletterPage({ params }: Props) {
  const { id } = await params
  const post = await prisma.newsletterPost.findUnique({ where: { id } })

  if (!post || post.status !== 'DRAFT') notFound()

  return (
    <div>
      <h1 className="mb-2 flex items-center gap-2 font-display text-2xl font-semibold text-primary md:text-3xl">
        <Mail className="h-6 w-6 text-accent" aria-hidden="true" />
        Edit newsletter
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        Changes remain private until you return to the newsletters page and choose
        Broadcast.
      </p>
      <NewsletterEditor
        initialDraft={{
          id: post.id,
          topic: post.topic,
          subject: post.subject,
          previewText: post.previewText ?? '',
          body: post.body,
          imageUrl: post.imageUrl ?? '',
        }}
      />
    </div>
  )
}
