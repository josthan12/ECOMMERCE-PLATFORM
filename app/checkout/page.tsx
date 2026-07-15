import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import CheckoutForm from './CheckoutForm'

export default async function CheckoutPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}