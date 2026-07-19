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
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">Checkout</h1>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Secure checkout
        </span>
      </div>
      <CheckoutForm />
    </div>
  )
}