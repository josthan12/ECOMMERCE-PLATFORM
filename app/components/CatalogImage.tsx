import Image from 'next/image'
import { cn } from '@/lib/cn'

type CatalogImageProps = {
  src: string
  alt: string
  sizes: string
  fit?: 'contain' | 'cover'
  className?: string
  eager?: boolean
}

function isLocalImagePath(src: string) {
  return src.startsWith('/') && !src.startsWith('//')
}

/**
 * Catalog imagery is moving to repository-owned files under /public/images.
 * Keep the native fallback only until the current test database is replaced;
 * its existing records may still point at arbitrary remote hosts that cannot
 * be safely added to Next.js images.remotePatterns.
 */
export default function CatalogImage({
  src,
  alt,
  sizes,
  fit = 'contain',
  className,
  eager = false,
}: CatalogImageProps) {
  const imageClassName = cn(fit === 'cover' ? 'object-cover' : 'object-contain', className)

  if (isLocalImagePath(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={imageClassName}
        loading={eager ? 'eager' : 'lazy'}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-full w-full', imageClassName)}
    />
  )
}
