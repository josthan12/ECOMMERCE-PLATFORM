import Image from 'next/image'

// No client-side JS is needed: reduced motion is handled in globals.css by
// swapping the video for its static poster.
export default function HeroAnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="hero-video-clip absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/videos/hero-companion-poster.jpg"
        >
          <source src="/videos/test7.webm" type="video/webm" />
          <source src="/videos/test7.mp4" type="video/mp4" />
        </video>
        <Image
          src="/videos/hero-companion-poster.jpg"
          alt=""
          fill
          sizes="100vw"
          className="hero-video-poster object-cover"
        />
      </div>
    </div>
  )
}
