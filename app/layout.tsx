import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getSiteUrl } from "@/lib/structuredData";
import "./globals.css";

export const revalidate = 60;

const geist = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "PokeSunshineTCG | You are my sunshine",
    template: "%s | PokeSunshineTCG",
  },
  description:
    "Authentic Pokémon, Riftbound, and trading card products for collectors in Singapore.",
  applicationName: "PokeSunshineTCG",
  openGraph: {
    type: "website",
    siteName: "PokeSunshineTCG",
    title: "PokeSunshineTCG | You are my sunshine",
    description:
      "Authentic Pokémon, Riftbound, and trading card products for collectors in Singapore.",
    images: ["/images/brand/pokesunshine-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PokeSunshineTCG | You are my sunshine",
    description:
      "Authentic Pokémon, Riftbound, and trading card products for collectors in Singapore.",
    images: ["/images/brand/pokesunshine-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        data-theme="light"
        suppressHydrationWarning
        className={`${geist.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-text font-sans">
          <Script src="/theme-initialization.js" strategy="beforeInteractive" />
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-md bg-primary px-4 py-3 font-semibold text-text-inverse focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
