'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart'

/**
 * Empties the bag once an order is confirmed paid. Deliberately tied to the
 * verified result rather than to leaving the checkout page — abandoning a
 * payment should leave the bag intact.
 */
export function ClearBagOnSuccess() {
  const clear = useCart((s) => s.clear)
  useEffect(() => clear(), [clear])
  return null
}
