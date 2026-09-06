'use client'

import Image from 'next/image'
import Link from 'next/link'
import { gsap, SplitText, prefersReducedMotion } from '@/lib/gsap'
import { useGsap } from '@/lib/useGsap'
import { FabricBackdrop } from '@/components/three/FabricBackdrop'
import { RotatingBadge } from '@/components/anim/RotatingBadge'

/**
 * The hero carries four of the ten scroll directions at once: the wordmark
 * splits vertically (odd characters up, even down), the photograph scales into
 * the page, the standfirst arrives from the left, and the whole block sits on
 * three parallax depths so the layers separate as you leave.
 */
export function Hero({ season, standfirst }: { season: string; standfirst: string }) {
  const scope = useGsap<HTMLElement>(({ scope: el }) => {
    const word = el.querySelector<HTMLElement>('[data-wordmark]')
    const media = el.querySelector<HTMLElement>('[data-hero-media]')
    const meta = el.querySelectorAll<HTMLElement>('[data-hero-meta]')

    if (prefersReducedMotion()) {
      gsap.set([word, ...Array.from(meta)], { opacity: 1 })
      return
    }

    const split = word ? SplitText.create(word, { type: 'chars', mask: 'chars' }) : null

    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })

    if (split) {
      gsap.set(word, { opacity: 1 })
      intro.from(split.chars, {
        yPercent: 120,
        duration: 1.4,
        stagger: { each: 0.035, from: 'start' },
      })
    }

    intro
      .from(media, { scale: 1.18, duration: 1.8, ease: 'power3.out' }, 0)
      .from(meta, { opacity: 0, x: -40, duration: 1.1, stagger: 0.12 }, 0.55)

    // Exit: the photograph keeps scaling while the characters tear apart,
    // odd up and even down, and the section clips closed.
    if (split) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
        .to(split.chars, {
          yPercent: (i) => (i % 2 === 0 ? -130 : 130),
          opacity: 0,
          stagger: { each: 0.012, from: 'center' },
          ease: 'power2.in',
        })
        .to(media, { scale: 1.16, ease: 'none' }, 0)
        .to(meta, { opacity: 0, y: -30, ease: 'none' }, 0)
    }

    // Layered depth — background, subject, foreground type each move at a
    // different rate, which is what gives the hero its sense of volume.
    gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((layer) => {
      const depth = Number(layer.dataset.depth ?? 1)
      gsap.to(layer, {
        yPercent: -14 * depth,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    })

    return () => split?.revert()
  }, [])

  return (
    <section
      ref={scope}
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-noir text-ivory"
    >
      {/* Photograph, deepest layer. */}
      <div data-hero-media data-depth="0.3" className="absolute inset-0 will-change-transform">
        <Image
          src="/img/hero.svg"
          alt="Fashionova SS26, photographed in Jamestown, Accra"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/45 to-noir/70" />
      </div>

      {/* WebGL cloth, mid layer — only on capable devices. */}
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <FabricBackdrop />
      </div>

      {/* Type, foreground. */}
      <div
        data-depth="1.2"
        className="gutter relative z-10 flex h-full flex-col justify-between pb-[7vh] pt-[16vh] will-change-transform"
      >
        <span data-hero-meta className="label block text-champagne">
          {season} — Accra, Ghana
        </span>

        <h1
          data-wordmark
          className="mb-8 uppercase opacity-0"
          style={{
            // Sized against the shorter axis too, so the wordmark never pushes
            // the standfirst off the bottom of a laptop screen.
            fontFamily: 'var(--font-display)',
            fontSize: 'min(12.5vw, 17vh)',
            lineHeight: 0.82,
            letterSpacing: '-0.045em',
          }}
        >
          Fashionova
        </h1>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <p data-hero-meta className="max-w-md text-mist">
            {standfirst}
          </p>

          <div className="flex items-center gap-8">
            <Link
              href="/shop"
              data-hero-meta
              className="label-lg link-underline text-ivory"
            >
              Shop the collection
            </Link>
            <Link href="/collections/harmattan" aria-label="View the SS26 collection">
              <RotatingBadge />
            </Link>
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="label absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-mist/60"
      >
        Scroll
      </span>
    </section>
  )
}
