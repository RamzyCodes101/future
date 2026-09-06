'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const FabricScene = dynamic(() => import('./FabricScene'), { ssr: false })

/**
 * Decides whether this visitor gets WebGL at all.
 *
 * A customer in Accra on a mid-range Android must never be handed a blank
 * canvas or a dropped frame rate — so the scene mounts only when the device
 * looks capable, the tab is visible, and the visitor has not asked for reduced
 * motion. Everything else keeps the static gradient underneath, which is the
 * design either way.
 */
export function FabricBackdrop() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return

    // Save-Data is a deliberate "give me less" from the visitor.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      if (!gl) return
    } catch {
      return
    }

    // Idle until the hero has actually painted, so the shader never competes
    // with LCP.
    const schedule =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600))
    const id = schedule(() => setEnabled(true))
    return () => window.clearTimeout(id as number)
  }, [])

  if (!enabled) return null
  return <FabricScene />
}
