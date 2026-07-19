// Ambient hero companion — now a short looping video instead of a sprite
// sheet. Still no client-side JS needed: reduced motion is handled in pure
// CSS (.hero-video-clip / .hero-video-poster in globals.css).
export default function HeroAnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/*<div className="absolute right-4 top-1/2 -translate-y-1/2 sm:right-12 md:right-20">*/}
      <div className="absolute inset-0">
        <video
          /*className="hero-video-band hero-video-clip"*/
          className="h-full w-full object-cover"
          

          autoPlay
          loop
          muted
          playsInline
          poster="/videos/hero-companion-poster.jpg"
        >{/*
          <source src="/videos/hero-companion.webm" type="video/webm" />
          <source src="/videos/hero-companion.mp4" type="video/mp4" /> */}
           <source src="/videos/test7.webm" type="video/webm" />
          <source src="/videos/test7.mp4" type="video/mp4" />

        </video>
        <img
          src="/videos/hero-companion-poster.jpg"
          alt=""
          className="hero-video-band hero-video-poster"
        />
      </div>
      {/*<div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent" />*/}
    </div>
  )
}