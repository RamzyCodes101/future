'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

const Viewer = dynamic(() => import('./ProductViewerScene'), { ssr: false })

/**
 * The 3D garment viewer only downloads once it is scrolled into view — a GLB
 * plus drei's environment map is easily the heaviest thing on the page, and
 * most visitors never reach it.
 */
export function ProductViewer({ src, name }: { src: string; name: string }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className="gutter border-t rule py-20">
      <h2 className="label mb-8 text-champagne-dim">Turn it around</h2>
      <div className="relative aspect-16/10 w-full overflow-hidden bg-bone">
        {visible ? (
          <Viewer src={src} />
        ) : (
          <div className="grid h-full place-items-center">
            <p className="label text-taupe">Loading the 3D view of {name}…</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-taupe">Drag to rotate. Scroll past to pause the render.</p>
    </section>
  )
}
