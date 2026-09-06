import type { Metadata } from 'next'

/**
 * A second root layout, for the Studio only.
 *
 * Sanity's UI owns the entire viewport and manages its own scrolling, so it
 * must not inherit the site's smooth scroll, custom cursor or page-transition
 * panel. Route groups let both trees have their own <html>.
 */
export const metadata: Metadata = {
  title: 'Fashionova Studio',
  robots: { index: false, follow: false },
}

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
