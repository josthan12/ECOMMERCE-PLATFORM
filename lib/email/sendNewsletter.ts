import { prisma } from '@/lib/prisma'
import { absoluteUrl, getSiteUrl } from '@/lib/structuredData'
import { NEWSLETTER_FROM_EMAIL, resend } from './resend'
import NewsletterPostEmail from './templates/newsletterPost'

export async function broadcastNewsletterPost(postId: string) {
  const post = await prisma.newsletterPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Newsletter post not found.')
  if (post.status !== 'DRAFT' && post.status !== 'FAILED') {
    throw new Error('Only draft or failed newsletters can be broadcast.')
  }

  let deliveries = await prisma.newsletterDelivery.findMany({
    where: { newsletterPostId: post.id },
  })

  if (deliveries.length === 0) {
    const subscribers = await prisma.user.findMany({
      where: { newsletterSubscribed: true },
      select: { id: true, email: true },
      orderBy: { createdAt: 'asc' },
    })

    if (subscribers.length === 0) {
      throw new Error('There are no subscribed customers to receive this newsletter.')
    }

    await prisma.$transaction([
      prisma.newsletterPost.update({
        where: { id: post.id },
        data: {
          status: 'SENDING',
          recipientCount: subscribers.length,
          successCount: 0,
          failureCount: 0,
        },
      }),
      prisma.newsletterDelivery.createMany({
        data: subscribers.map((subscriber) => ({
          newsletterPostId: post.id,
          userId: subscriber.id,
          email: subscriber.email,
        })),
        skipDuplicates: true,
      }),
    ])

    deliveries = await prisma.newsletterDelivery.findMany({
      where: { newsletterPostId: post.id },
    })
  } else {
    await prisma.newsletterPost.update({
      where: { id: post.id },
      data: { status: 'SENDING' },
    })
  }

  const currentlySubscribed = new Set(
    (
      await prisma.user.findMany({
        where: {
          newsletterSubscribed: true,
          id: { in: deliveries.map((delivery) => delivery.userId) },
        },
        select: { id: true },
      })
    ).map((subscriber) => subscriber.id)
  )

  for (const delivery of deliveries) {
    if (delivery.status === 'SENT' || delivery.status === 'SKIPPED') continue

    if (!currentlySubscribed.has(delivery.userId)) {
      await prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SKIPPED',
          error: 'Customer unsubscribed before delivery.',
        },
      })
      continue
    }

    try {
      const result = await resend.emails.send(
        {
          from: NEWSLETTER_FROM_EMAIL,
          to: delivery.email,
          subject: post.subject,
          react: NewsletterPostEmail({
            topic: post.topic,
            previewText: post.previewText,
            body: post.body,
            imageUrl: post.imageUrl ? absoluteUrl(post.imageUrl) : null,
            managePreferencesUrl: `${getSiteUrl()}/#newsletter`,
          }),
        },
        { idempotencyKey: `newsletter/${post.id}/${delivery.id}` }
      )

      if (result.error || !result.data) {
        throw new Error(result.error?.message || 'Email provider did not accept the email.')
      }

      await prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SENT',
          resendEmailId: result.data.id,
          error: null,
          sentAt: new Date(),
        },
      })
    } catch (error) {
      await prisma.newsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown email error.',
        },
      })
    }
  }

  const [successCount, failureCount, skippedCount] = await Promise.all([
    prisma.newsletterDelivery.count({
      where: { newsletterPostId: post.id, status: 'SENT' },
    }),
    prisma.newsletterDelivery.count({
      where: { newsletterPostId: post.id, status: 'FAILED' },
    }),
    prisma.newsletterDelivery.count({
      where: { newsletterPostId: post.id, status: 'SKIPPED' },
    }),
  ])

  const completed = failureCount === 0
  const updatedPost = await prisma.newsletterPost.update({
    where: { id: post.id },
    data: {
      status: completed ? 'SENT' : 'FAILED',
      sentAt: completed ? new Date() : null,
      successCount,
      failureCount,
    },
  })

  return {
    post: updatedPost,
    successCount,
    failureCount,
    skippedCount,
  }
}
