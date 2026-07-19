import HeroAnimatedBackground from './HeroAnimatedBackground'

const HERO_CONTENT = {
  headline: 'Welcome to PokeSunshineTCG',
  subtext: 'Authentic Pokémon cards, sealed products, and collector favorites.',
}

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-surface-muted to-background">
      <HeroAnimatedBackground />
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
        <div className="max-w-xl">
          <h1 className="animate-fade-up font-display text-4xl font-semibold text-border md:text-5xl">
            {HERO_CONTENT.headline}
          </h1>
          <p className="animate-fade-up-delay mt-4 text-lg text-border ">
            {HERO_CONTENT.subtext}
          </p>
        </div>
      </div>
    </section>
  )
}