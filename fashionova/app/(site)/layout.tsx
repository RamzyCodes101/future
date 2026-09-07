import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getSiteSettings } from '@/lib/catalogue'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { Cursor } from '@/components/site/Cursor'
import { ScrollProgress } from '@/components/site/ScrollProgress'
import { PageTransition } from '@/components/site/PageTransition'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import { CartMount } from '@/components/shop/CartMount'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Fashionova — Contemporary Ghanaian Tailoring',
    template: '%s — Fashionova',
  },
  description:
    'Fashionova is a contemporary fashion house in Accra, Ghana, working in wax print, hand-woven kente and naturally dyed adire. Cut and sewn in Osu.',
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    siteName: 'Fashionova',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0b0c',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en-GH">
      <body>
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999] focus:bg-noir focus:px-4 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <PageTransition />
          <ScrollProgress />
          <Cursor />
          <Header announcement={settings.announcement} />
          <main id="main">{children}</main>
          <Footer settings={settings} />
          <WhatsAppButton settings={settings} />
          <CartMount freeShippingThreshold={settings.freeShippingThreshold} />
        </SmoothScroll>
      </body>
    </html>
  )
}
