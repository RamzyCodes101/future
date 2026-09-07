'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart'

const CartDrawer = dynamic(() => import('./CartDrawer').then((m) => m.CartDrawer), {
  ssr: false,
})

/**
 * Defers the bag drawer until it is first opened.
 *
 * The drawer is the only thing on the site using Motion, and it lives in the
 * root layout — so every page was paying for an animation library that most
 * visits never trigger. Once opened it stays mounted, so the exit animation
 * still has something to animate.
 */
export function CartMount({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const isOpen = useCart((s) => s.isOpen)
  const [everOpened, setEverOpened] = useState(false)

  useEffect(() => {
    if (isOpen) setEverOpened(true)
  }, [isOpen])

  if (!everOpened) return null
  return <CartDrawer freeShippingThreshold={freeShippingThreshold} />
}
