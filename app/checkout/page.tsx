import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import CheckoutForm from './CheckoutForm'

export default async function CheckoutPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout')
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-accent uppercase">
            Final details
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] text-primary md:text-5xl">
            Checkout
          </h1>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Secure checkout
        </span>
      </div>
      <CheckoutForm />
    </div>
  )
}
