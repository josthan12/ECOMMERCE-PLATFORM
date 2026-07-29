import { MailPlus } from 'lucide-react'
import NewsletterEditor from '../NewsletterEditor'

export default function NewNewsletterPage() {
  return (
    <div>
      <h1 className="mb-2 flex items-center gap-2 font-display text-2xl font-semibold text-primary md:text-3xl">
        <MailPlus className="h-6 w-6 text-accent" aria-hidden="true" />
        Create newsletter
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        Build and preview the post here. It will remain a draft until you broadcast it
        from the newsletters page.
      </p>
      <NewsletterEditor />
    </div>
  )
}
