'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { Observer } from 'gsap/Observer'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

/**
 * Plugins are registered exactly once, on the client. Registering inside a
 * component would re-run on every mount and quietly leak listeners.
 */
let registered = false

export function registerGsap() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin)
  gsap.defaults({ ease: 'power3.out', duration: 1 })
  registered = true
}

registerGsap()

export { gsap, ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin }

/** True when the visitor has asked the OS for less movement. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
