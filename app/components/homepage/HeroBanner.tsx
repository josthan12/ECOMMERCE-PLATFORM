// Static content for now. When admin-configurable homepage sections are built
// (Phase 7), this component will read its content from the database instead.
const HERO_CONTENT = {
  headline: 'Shop the Latest Arrivals',
  subtext: 'Quality products, delivered fast across Singapore.',
  imageUrl: '',
}

export default function HeroBanner() {
  return (
    <div className="w-full h-80 bg-gray-100 flex items-center">
      {HERO_CONTENT.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_CONTENT.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="relative max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800">{HERO_CONTENT.headline}</h1>
        <p className="mt-3 text-lg text-gray-600">{HERO_CONTENT.subtext}</p>
      </div>
    </div>
  )
}