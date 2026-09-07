'use client'

import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

/**
 * An infinite type strip whose speed and direction follow the scroll.
 *
 * Scroll down and it runs left; scroll up and it reverses. Standing still it
 * drifts at a base speed, so the page is never completely inert.
 */
export function Marquee({
  text,
  className = '',
  baseSpeed = 0.6,
  repeat = 6,
}: {
  text: string
  className?: string
  baseSpeed?: number
  repeat?: number
}) {
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    const track = el.querySelector<HTMLElement>('[data-track]')
    if (!track || prefersReducedMotion()) return

    const tween = gsap.to(track, {
      xPercent: -50,
      repeat: -1,
      duration: 28,
      ease: 'none',
    })

    let direction = 1
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity()
        if (v !== 0) direction = v > 0 ? 1 : -1
        const boost = gsap.utils.clamp(baseSpeed, 7, Math.abs(v) / 260 + baseSpeed)
        gsap.to(tween, { timeScale: boost * direction, duration: 0.35, overwrite: true })
      },
    })

    gsap.set(tween, { timeScale: baseSpeed })

    return () => {
      st.kill()
      tween.kill()
    }
  }, [])

  return (
    <div
      ref={scope}
      className={`relative overflow-hidden ${className}`}
      aria-hidden="true"
      /* A repeated ghost wordmark carrying no information — WCAG 1.4.3 exempts
         pure decoration from the contrast minimum. Tagged so the accessibility
         audit excludes it deliberately rather than silently. */
      data-decorative="true"
    >
      <div data-track className="flex w-max whitespace-nowrap will-change-transform">
        {Array.from({ length: repeat * 2 }, (_, i) => (
          <span key={i} className="text-hero px-6 shrink-0">
            {text}
            <span className="text-champagne px-6 align-middle text-[0.4em]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
