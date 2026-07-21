import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Get to know PokeSunshineTCG — a home for Pokémon and TCG collectors, players, and community.',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
        Welcome to PokeSunshineTCG!
      </h1>

      <div className="mt-6 rounded-lg border border-border-light bg-surface p-6 shadow-card">
        <div className="space-y-5 leading-relaxed text-text-muted">
          <p>
            Whether you&apos;re a seasoned collector, a competitive player, or just
            starting your journey into the world of trading card games,
            you&apos;re always welcome here. While our name is inspired by Pokémon,
            we welcome enthusiasts from all TCGs who share a passion for
            collecting, playing, and connecting with others.
          </p>

          <p>
            PokeSunshineTCG is currently managed by yours truly, but we&apos;re
            always looking to grow our team and our community. We hope
            you&apos;ll stick around, join the conversation, and become part of
            our friendly and welcoming community. We look forward to having you
            with us!
          </p>
        </div>
      </div>
    </div>
  )
}