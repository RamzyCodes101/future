'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'
import { gsap } from './gsap'

/**
 * Runs a GSAP setup function inside a scoped context and reverts it on
 * unmount. The revert is what keeps route changes clean — without it every
 * navigation leaves its ScrollTriggers attached and the page slowly seizes up.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (ctx: { scope: T }) => void,
  deps: unknown[] = []
): RefObject<T | null> {
  const scope = useRef<T | null>(null)

  useLayoutEffect(() => {
    if (!scope.current) return
    const el = scope.current
    const ctx = gsap.context(() => setup({ scope: el }), el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}
