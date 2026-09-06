'use client'

import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

/**
 * Circular text that turns continuously and speeds up with the scroll.
 * Decorative, so it is hidden from assistive technology; the link it wraps
 * carries the real label.
 */
export function RotatingBadge({
  text = 'SHOP SS26 · MADE IN ACCRA · ',
  size = 152,
}: {
  text?: string
  size?: number
}) {
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    if (prefersReducedMotion()) return
    const ring = el.querySelector('[data-ring]')
    if (!ring) return

    const spin = gsap.to(ring, { rotate: 360, duration: 22, repeat: -1, ease: 'none' })

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(1, 6, Math.abs(self.getVelocity()) / 400 + 1)
        gsap.to(spin, { timeScale: boost, duration: 0.4, overwrite: true })
      },
    })

    return () => {
      st.kill()
      spin.kill()
    }
  }, [])

  const chars = text.split('')
  const radius = size / 2 - 14

  return (
    <div ref={scope} style={{ width: size, height: size }} className="relative" aria-hidden="true">
      <div data-ring className="absolute inset-0 will-change-transform">
        {chars.map((char, i) => (
          <span
            key={i}
            className="label absolute left-1/2 top-1/2 origin-[0_0]"
            style={{
              transform: `rotate(${(360 / chars.length) * i}deg) translateY(-${radius}px)`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
      <span className="absolute inset-0 grid place-items-center text-champagne text-lg">✦</span>
    </div>
  )
}
