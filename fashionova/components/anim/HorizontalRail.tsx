'use client'

import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

/**
 * Pins a section and translates its track sideways as you scroll down.
 *
 * The cards also lift and straighten as they cross the viewport centre, which
 * is what stops a horizontal rail feeling like a slab sliding past.
 *
 * On small screens the pin is dropped entirely — pinning fights native touch
 * scrolling — and the track becomes an ordinary swipeable overflow container.
 */
export function HorizontalRail({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    const track = el.querySelector<HTMLElement>('[data-track]')
    if (!track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => track.scrollWidth - window.innerWidth

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const cards = gsap.utils.toArray<HTMLElement>('[data-rail-card]', track)
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, rotate: 1.4 },
          {
            y: -40,
            rotate: -1.4,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        )
      })

      return () => tween.kill()
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={scope} className={className}>
      <div
        data-track
        className={
          prefersReducedMotion()
            ? 'flex gap-6 overflow-x-auto pb-6'
            : 'flex gap-6 max-[899px]:overflow-x-auto max-[899px]:pb-6 will-change-transform'
        }
      >
        {children}
      </div>
    </div>
  )
}
