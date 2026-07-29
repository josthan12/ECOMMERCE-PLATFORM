import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with PokeSunshineTCG via Telegram or email for questions, support, or business enquiries.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
        Contact Us
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-text-muted">
        <p>
          Have a question about an order, a product, or anything else? Feel free to
          get in touch—we’re happy to help.
        </p>

        <div className="rounded-lg border border-border-light bg-surface p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <h2 className="font-medium text-text">Telegram</h2>
              <p className="mt-1 text-text-muted">
                Contact us on Telegram at{' '}
                <a
                  href="https://t.me/pokesunshine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:text-accent"
                >
                  @pokesunshine
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-medium text-text">Email</h2>
              <p className="mt-1 text-text-muted">
                For business enquiries or any other questions, email us at{' '}
                <a
                  href="mailto:pokesunshinetcg@gmail.com"
                  className="text-primary underline underline-offset-2 hover:text-accent"
                >
                  pokesunshinetcg@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <p>
          We’ll get back to you as soon as possible. Thank you for reaching out!
        </p>
      </div>
    </div>
  )
}
