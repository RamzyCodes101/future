'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/types'

/**
 * A large share of Ghanaian retail conversation happens on WhatsApp — for many
 * customers this is the primary contact channel, not a fallback.
 *
 * It reveals only once the visitor is past the opening screen, so it never
 * covers the hero or the rotating badge.
 */
export function WhatsAppButton({ settings }: { settings: SiteSettings }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.75)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const message = encodeURIComponent('Hello Fashionova — I have a question about a piece.')

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={`label fixed bottom-5 right-5 z-40 rounded-full border border-champagne/40 bg-noir/90 px-5 py-3.5 text-ivory backdrop-blur transition-all duration-500 hover:bg-jade ${
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      WhatsApp us
    </a>
  )
}
