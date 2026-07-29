import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: false },
}

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
