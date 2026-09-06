'use client'

import { useRef } from 'react'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

type Mode = 'chars' | 'lines' | 'words'

/**
 * A heading that masks in per character, word or line.
 *
 * The masking is what separates this from a fade: each unit sits inside an
 * overflow-hidden wrapper and travels up from below its own baseline, so the
 * type appears to be revealed rather than to materialise.
 */
export function SplitHeading({
  children,
  as: Tag = 'h2',
  mode = 'lines',
  className = '',
  delay = 0,
  stagger,
  scrub = false,
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'p'
  mode?: Mode
  className?: string
  delay?: number
  stagger?: number
  scrub?: boolean
}) {
  const inner = useRef<HTMLElement | null>(null)

  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return
    }

    const target = el.querySelector<HTMLElement>('[data-split]')
    if (!target) return

    const split = SplitText.create(target, {
      type: mode === 'chars' ? 'chars,words,lines' : mode === 'words' ? 'words,lines' : 'lines',
      mask: mode,
      linesClass: 'split-line',
    })

    const units = split[mode] as HTMLElement[]
    gsap.set(el, { opacity: 1 })

    gsap.from(units, {
      yPercent: 118,
      rotate: mode === 'chars' ? 4 : 0,
      duration: 1.25,
      ease: 'expo.out',
      delay,
      stagger: stagger ?? (mode === 'chars' ? 0.026 : 0.09),
      scrollTrigger: scrub
        ? { trigger: el, start: 'top 92%', end: 'bottom 55%', scrub: 1 }
        : { trigger: el, start: 'top 86%', once: true },
    })

    return () => split.revert()
  }, [mode, scrub])

  return (
    <div ref={scope} className="opacity-0">
      <Tag ref={inner as never} data-split className={className}>
        {children}
      </Tag>
    </div>
  )
}
