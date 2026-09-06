'use client'

import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

/**
 * A ring that trails the pointer and swells over anything interactive.
 *
 * quickTo is used rather than a tween per mousemove — it reuses one tween
 * instance, which is the difference between a cursor that keeps up and one
 * that stutters. Pointer-coarse devices never mount it.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })

    gsap.set(el, { opacity: 0, xPercent: -50, yPercent: -50 })

    let shown = false
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!shown) {
        shown = true
        gsap.to(el, { opacity: 1, duration: 0.3 })
      }
    }

    const grow = () => gsap.to(el, { scale: 2.4, duration: 0.4, ease: 'expo.out' })
    const shrink = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'expo.out' })

    const interactive = 'a, button, [role="button"], input, select, textarea, [data-cursor]'
    const over = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.(interactive)) grow()
    }
    const out = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.(interactive)) shrink()
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    document.addEventListener('pointerout', out)

    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', out)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-6 w-6 rounded-full border border-champagne mix-blend-difference [@media(pointer:fine)]:block"
    />
  )
}
