'use client'

import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

/** A hairline champagne rail down the right edge, scrubbed to page progress. */
export function ScrollProgress() {
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    if (prefersReducedMotion()) return
    const bar = el.querySelector('[data-bar]')
    if (!bar) return

    gsap.fromTo(
      bar,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.4 },
      }
    )
  }, [])

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="pointer-events-none fixed right-0 top-0 z-50 hidden h-full w-px bg-mist/60 md:block"
    >
      <div data-bar className="h-full w-full origin-top bg-champagne" />
    </div>
  )
}
