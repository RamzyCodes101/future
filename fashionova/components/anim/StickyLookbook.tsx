'use client'

import Image from 'next/image'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

interface Panel {
  image: string
  alt: string
  eyebrow: string
  title: string
  body: string
}

/**
 * The image column pins while the copy column scrolls past it, and the images
 * cross-fade on a scrubbed timeline as each caption arrives.
 */
export function StickyLookbook({ panels }: { panels: Panel[] }) {
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const media = gsap.utils.toArray<HTMLElement>('[data-panel-image]', el)
      const copy = gsap.utils.toArray<HTMLElement>('[data-panel-copy]', el)

      gsap.set(media.slice(1), { autoAlpha: 0, scale: 1.08 })

      copy.forEach((block, i) => {
        if (i === 0) return
        gsap.to(media[i], {
          autoAlpha: 1,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: 'top 72%',
            end: 'top 32%',
            scrub: true,
          },
        })
      })

      return () => {
        gsap.set(media, { clearProps: 'all' })
      }
    })

    return () => mm.revert()
  }, [panels.length])

  const reduced = prefersReducedMotion()

  return (
    <div ref={scope} className="gutter grid gap-12 py-24 md:grid-cols-2 md:gap-20">
      <div className="md:sticky md:top-24 md:h-[70vh]">
        <div className="relative h-[60vh] w-full overflow-hidden md:h-full">
          {panels.map((panel, i) => (
            <Image
              key={panel.image}
              data-panel-image
              src={panel.image}
              alt={panel.alt}
              fill
              sizes="(max-width: 899px) 100vw, 45vw"
              className="object-cover"
              style={reduced && i > 0 ? { display: 'none' } : undefined}
              priority={i === 0}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {panels.map((panel) => (
          <div
            key={panel.title}
            data-panel-copy
            className="flex min-h-[55vh] flex-col justify-center border-b rule py-12 last:border-0"
          >
            <span className="label text-champagne-dim mb-5 block">{panel.eyebrow}</span>
            <h3 className="text-section mb-5">{panel.title}</h3>
            <p className="max-w-md text-graphite">{panel.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
