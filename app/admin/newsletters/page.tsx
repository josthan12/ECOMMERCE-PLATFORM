import Link from 'next/link'
import { Mail, Plus } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { prisma } from '@/lib/prisma'
import NewsletterActions from './NewsletterActions'

export default async function NewslettersPage() {
  const [posts, subscriberCount] = await Promise.all([
    prisma.newsletterPost.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where: { newsletterSubscribed: true } }),
  ])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">
            Newsletters
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {subscriberCount} subscribed {subscriberCount === 1 ? 'customer' : 'customers'}
          </p>
        </div>
        <Link href="/admin/newsletters/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New post
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text">
        Saving and editing never sends an email. Broadcasts only begin after you choose
        Broadcast and confirm the recipient count.
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-border-light bg-surface py-16 text-center">
          <Mail className="h-8 w-8 text-text-light" aria-hidden="true" />
          <p className="mt-3 font-display text-lg text-primary">No newsletter posts yet.</p>
          <p className="mt-1 text-sm text-text-muted">Create your first draft when ready.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border-light bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Topic</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Delivery</th>
                  <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border-b border-border-light last:border-b-0 hover:bg-surface-hover ${
                      index % 2 === 1 ? 'bg-surface-muted/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      {post.status === 'DRAFT' ? (
                        <Link
                          href={`/admin/newsletters/${post.id}/edit`}
                          className="font-medium text-primary hover:text-accent"
                        >
                          {post.topic}
                        </Link>
                      ) : (
                        <span className="font-medium text-text">{post.topic}</span>
                      )}
                      <p className="mt-0.5 max-w-md truncate text-xs text-text-muted">
                        {post.subject}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusLabel status={post.status} />
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {post.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {post.status === 'DRAFT'
                        ? 'Not sent'
                        : `${post.successCount}/${post.recipientCount} sent`}
                    </td>
                    <td className="px-4 py-3">
                      <NewsletterActions
                        postId={post.id}
                        topic={post.topic}
                        status={post.status}
                        subscriberCount={subscriberCount}
                        failureCount={post.failureCount}
                      />
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

function StatusLabel({ status }: { status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED' }) {
  const styles = {
    DRAFT: 'text-text-muted',
    SENDING: 'text-info',
    SENT: 'text-success',
    FAILED: 'text-error',
  }

  return <span className={`font-medium ${styles[status]}`}>{formatStatus(status)}</span>
}

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}
