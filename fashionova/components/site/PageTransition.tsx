'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * A near-black panel sweeps across the viewport on every route change.
 *
 * It runs on arrival rather than on departure: App Router unmounts the old
 * tree before an exit animation could finish, so animating the outgoing page
 * produces a flash. Covering the incoming one is both simpler and steadier.
 */
export function PageTransition() {
  const panel = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    const el = panel.current
    if (!el) return

    if (first.current) {
      first.current = false
      return
    }

    if (prefersReducedMotion()) return

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { visibility: 'hidden' })
          ScrollTrigger.refresh()
        },
      })
      .set(el, { visibility: 'visible', transformOrigin: 'bottom' })
      .fromTo(
        el,
        { scaleY: 1 },
        { scaleY: 0, duration: 0.85, ease: 'expo.inOut', transformOrigin: 'top' }
      )
  }, [pathname])

  return (
    <div
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-noir"
      style={{ visibility: 'hidden' }}
    />
  )
}
