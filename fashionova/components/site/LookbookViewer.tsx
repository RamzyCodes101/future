'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { LookbookEntry } from '@/lib/types'
import { gsap } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'

const LookbookScene = dynamic(() => import('@/components/three/LookbookScene'), { ssr: false })

const TRIGGER_ID = 'lookbook-scroller'

/**
 * The lookbook.
 *
 * On a capable device this is one pinned WebGL canvas the visitor scrubs
 * through. Everywhere else — reduced motion, no WebGL, a weak device, or
 * Save-Data — it degrades to a plain stacked gallery of the same photographs,
 * which is a perfectly good lookbook and costs nothing.
 */
export function LookbookViewer({ entries }: { entries: LookbookEntry[] }) {
  const [webgl, setWebgl] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(max-width: 768px)').matches) return
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return

    try {
      const gl = document.createElement('canvas').getContext('webgl2')
      if (!gl) return
    } catch {
      return
    }
    setWebgl(true)
  }, [])

  // The captions ride along with the scrub, one per screen of scroll.
  const scope = useGsap<HTMLDivElement>(({ scope: el }) => {
    if (!webgl) return
    const captions = gsap.utils.toArray<HTMLElement>('[data-caption]', el)
    captions.forEach((caption, i) => {
      gsap.fromTo(
        caption,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: `#${TRIGGER_ID}`,
            start: () => `${(i / entries.length) * 100}% top`,
            end: () => `${((i + 1) / entries.length) * 100}% top`,
            toggleActions: 'play reverse play reverse',
          },
        }
      )
    })
  }, [webgl, entries.length])

  if (!webgl) {
    return (
      <div className="grid gap-1 md:grid-cols-2">
        {entries.map((entry, i) => (
          <figure key={entry._id} className="relative" data-anim="fade">
            <div className="relative aspect-3/4 bg-bone">
              <Image
                src={entry.image.url}
                alt={entry.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
            <figcaption className="label absolute bottom-4 left-4 text-ivory mix-blend-difference">
              {entry.title}
            </figcaption>
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div ref={scope}>
      {/* The tall element that supplies the scroll distance. */}
      <div id={TRIGGER_ID} style={{ height: `${entries.length * 100}svh` }} className="relative">
        <div className="sticky top-0 h-svh w-full overflow-hidden bg-noir">
          <LookbookScene images={entries.map((e) => e.image.url)} triggerId={TRIGGER_ID} />

          <div className="pointer-events-none absolute inset-0">
            {entries.map((entry) => (
              <div
                key={entry._id}
                data-caption
                className="absolute bottom-10 left-0 w-full gutter opacity-0"
              >
                <p className="label text-champagne">{entry.title}</p>
                {entry.credit ? (
                  <p className="mt-1.5 text-xs text-mist/60">{entry.credit}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The same photographs, readable without WebGL and by search engines. */}
      <ul className="sr-only">
        {entries.map((entry) => (
          <li key={entry._id}>{entry.image.alt}</li>
        ))}
      </ul>
    </div>
  )
}
