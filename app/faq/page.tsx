import type { Metadata } from 'next'
import Link from 'next/link'
import { SELF_COLLECTION_ADDRESS, TELEGRAM_URL } from '@/lib/constants'
import { GST_ENABLED, GST_RATE_DISPLAY } from '@/lib/gst'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about ordering, shipping, self-collection, and our sales policy.',
  alternates: { canonical: '/faq' },
}

type FaqItem = { q: string; a: string }
type FaqGroup = { heading: string; items: FaqItem[] }

function buildFaqGroups(): FaqGroup[] {
  return [
    {
      heading: 'Ordering & Payment',
      items: [
        {
          q: 'How do I pay?',
          a: 'Checkout is powered by HitPay via PayNow — scan the QR code shown at checkout and complete payment within its 5-minute validity window.',
        },
        {
          q: 'Is GST included in the price?',
          a: GST_ENABLED
            ? `${GST_RATE_DISPLAY}% GST is calculated on your subtotal (after any discount) plus your delivery/self-collection fee, and shown as a separate line before you confirm your order.`
            : 'We are not currently GST-registered, so no GST is added to your order.',
        },
        {
          q: "I paid but the confirmation page looks unfamiliar or I'm not signed in.",
          a: 'This can happen if you scan the PayNow QR code with a different device than the one you checked out on. Your payment is still recorded correctly — sign in and check My Orders to see your order.',
        },
        {
          q: "What happens if I don't complete payment in time?",
          a: 'The QR code expires 5 minutes after checkout. If payment is not completed, the order is automatically cancelled and no charge is made — you are welcome to check out again.',
        },
      ],
    },
    {
      heading: 'Shipping & Self-Collection',
      items: [
        {
          q: 'What delivery options do you offer?',
          a: 'Delivery (a flat fee, GST included in the total shown at checkout) or Self-Collection, which is free.',
        },
        {
          q: 'Where do I collect my order?',
          a: `Self-collection orders are ready at: ${SELF_COLLECTION_ADDRESS}. You'll receive an email once your order is packed and ready for pickup.`,
        },
        {
          q: 'How will I know my order has shipped or is ready for pickup?',
          a: "We'll email you automatically once your order is on its way (delivery) or packed and ready (self-collection).",
        },
      ],
    },
    {
      heading: 'Pre-Orders',
      items: [
        {
          q: 'Do you offer pre-orders for upcoming releases?',
          a: 'Yes. Pre-order items are listed as regular products with "(Pre-Order)" noted in the name or description, along with an estimated availability window. Payment is collected at checkout as with any other order.',
        },
      ],
    },
    {
      heading: 'Product Condition & Our Sales Policy',
      items: [
        {
          q: 'Will I get a specific art variant?',
          a: 'Random art will be given unless a specific variant is stated on the product page.',
        },
        {
          q: 'Is packaging condition guaranteed?',
          a: 'Product condition is not guaranteed. Minor imperfections such as dents, scratches, or shrink wrap tears may be present.',
        },
        {
          q: 'Can I get a refund or exchange?',
          a: 'All sales are final.',
        },
      ],
    },
    {
      heading: 'Order Tracking & Updates',
      items: [
        {
          q: 'How do I check my order history?',
          a: 'Sign in and visit My Orders for your full order history and current status.',
        },
        {
          q: 'Where do you post stock and arrival updates?',
          a: TELEGRAM_URL
            ? 'Join our Telegram channel to get notified as soon as stock is ready — the link is on our Contact page.'
            : 'In our Telegram channel — link coming soon.',
        },
      ],
    },
  ]
}

export default function FaqPage() {
  const groups = buildFaqGroups()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 text-text-muted">
        Can&apos;t find what you&apos;re looking for? Reach out via our{' '}
        <Link href="/contact" className="text-primary underline underline-offset-2 hover:text-accent">
          contact page
        </Link>
        .
      </p>

      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.heading}>
            <h2 className="font-display text-xl font-semibold text-primary">{group.heading}</h2>
            <div className="mt-4 divide-y divide-border-light rounded-lg border border-border-light bg-surface shadow-card">
              {group.items.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-text marker:content-none [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="ml-4 shrink-0 text-text-light transition-transform duration-150 ease-out group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
