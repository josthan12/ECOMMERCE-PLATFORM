'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import ScrollReveal from '../ScrollReveal'
import Button from '../ui/Button'

export default function Newsletter() {
  const { isLoaded, userId } = useAuth()
  const [preference, setPreference] = useState<{
    userId: string
    subscribed: boolean
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const subscribed = preference && preference.userId === userId ? preference.subscribed : null

  useEffect(() => {
    if (!userId) return

    const currentUserId = userId
    let cancelled = false

    async function loadSubscription() {
      try {
        const response = await fetch('/api/newsletter')
        if (!response.ok) throw new Error('Unable to load newsletter preference.')

        const data = await response.json()
        if (!cancelled) {
          setPreference({ userId: currentUserId, subscribed: data.subscribed === true })
        }
      } catch {
        if (!cancelled) setError('Unable to load your newsletter preference.')
      }
    }

    loadSubscription()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleSubscription = async () => {
    setError('')

    if (!userId) {
      window.location.assign(`/sign-in?redirect_url=${encodeURIComponent('/#newsletter')}`)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/newsletter', {
        method: subscribed ? 'DELETE' : 'POST',
      })
      if (!response.ok) throw new Error('Unable to update newsletter preference.')

      const data = await response.json()
      setPreference({ userId, subscribed: data.subscribed === true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isLoadingPreference = !!userId && subscribed === null && !error
  const buttonLabel = !isLoaded
    ? 'Loading…'
    : !userId
      ? 'Sign in to subscribe'
      : isSaving
        ? 'Saving…'
        : subscribed
          ? 'Unsubscribe'
          : 'Subscribe'

  return (
    <section
      id="newsletter"
      className="scroll-mt-40 border-t border-white/10 bg-ink py-16 text-on-ink md:py-20"
    >
      <ScrollReveal className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-on-ink md:text-4xl">
              From PokeSunshine
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-ink-muted">
              Hear about new products, my thoughts, and occasional store updates.
            </p>
          </div>

          <div className="md:min-w-72 md:text-right">
            <Button
              type="button"
              variant="accent"
              size="lg"
              className="w-full md:w-auto"
              onClick={handleSubscription}
              disabled={!isLoaded || isLoadingPreference || isSaving}
            >
              {buttonLabel}
            </Button>
            <p className="mt-3 text-xs text-on-ink-muted" aria-live="polite">
              {userId && subscribed
                ? 'You are subscribed with your account email.'
                : userId
                  ? 'Newsletter updates use your account email.'
                  : 'Sign in or create an account to manage your subscription.'}
            </p>
            {error && (
              <p className="mt-2 text-sm text-on-ink" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
