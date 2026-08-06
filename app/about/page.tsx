import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'

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

      <div className="mt-16 border-t border-border-light pt-12 text-center">
        <h2 className="font-display text-3xl font-semibold text-primary">
          Join the Community
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-text-muted">
          Get the latest updates, share your collection, and connect with other collectors on our official Telegram channel.
        </p>
        <div className="mt-8">
          <a
            href="https://t.me/POKESUNSHINETCG/1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-lg font-medium text-text-inverse transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <span>Join @PokeSunshineTCG</span>
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}