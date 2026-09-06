'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Smooth scroll + the global entrance choreography.
 *
 * Lenis owns the scroll position and GSAP's ticker drives it, so there is one
 * clock rather than two fighting each other. ScrollTrigger is updated from
 * Lenis rather than from the native scroll event.
 *
 * Under prefers-reduced-motion nothing here runs: no smoothing, no pinning,
 * no transforms. Elements are simply made visible.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = prefersReducedMotion()

    if (reduced) {
      gsap.set('[data-anim]', { clearProps: 'all', opacity: 1 })
      return
    }

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      // --- Directional entrances -------------------------------------------
      // Each direction is applied by data-anim, so a section chooses how it
      // arrives without any bespoke JS. Varying these is what stops the page
      // reading as one repeated fade-up.
      const from: Record<string, gsap.TweenVars> = {
        fade: { opacity: 0 },
        up: { opacity: 0, y: 64 },
        down: { opacity: 0, y: -64 },
        left: { opacity: 0, x: -80 },
        right: { opacity: 0, x: 80 },
        scale: { opacity: 0, scale: 0.88 },
      }

      Object.entries(from).forEach(([key, vars]) => {
        ScrollTrigger.batch(`[data-anim="${key}"]`, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              vars,
              {
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 1.15,
                ease: 'expo.out',
                stagger: 0.075,
                overwrite: true,
              }
            ),
        })
      })

      // --- Velocity skew ----------------------------------------------------
      // Images lean into the direction of travel and settle when you stop.
      // Cheap, and it is most of what makes a scroll feel weighted.
      const skewTargets = gsap.utils.toArray<HTMLElement>('[data-skew]')
      if (skewTargets.length) {
        const setters = skewTargets.map((el) => gsap.quickSetter(el, 'skewY', 'deg'))
        const clamp = gsap.utils.clamp(-6, 6)
        ScrollTrigger.create({
          onUpdate: (self) => {
            const skew = clamp(self.getVelocity() / -320)
            setters.forEach((set) => set(skew))
          },
        })
        gsap.ticker.add(() => {
          setters.forEach((set, i) => {
            const current = gsap.getProperty(skewTargets[i], 'skewY') as number
            if (Math.abs(current) > 0.01) set(current * 0.88)
          })
        })
      }

      return () => {
        gsap.set('[data-anim]', { clearProps: 'all', opacity: 1 })
      }
    })

    // Fonts and images both change layout height; a stale trigger fires in the
    // wrong place, which reads as "the animations are broken on reload".
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      mm.revert()
      lenis.destroy()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return <>{children}</>
}
