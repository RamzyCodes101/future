'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { lineKey, useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/money'

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { lines, isOpen, close, setQuantity, subtotal } = useCart()
  const total = subtotal()
  const remaining = Math.max(0, freeShippingThreshold - total)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-noir/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ivory"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 38 }}
          >
            <div className="flex items-center justify-between border-b rule px-6 py-5">
              <h2 className="label-lg">Your bag</h2>
              <button onClick={close} className="label link-underline">
                Close
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <p className="text-taupe">Nothing here yet.</p>
                <Link href="/shop" onClick={close} className="label link-underline">
                  Browse the collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y rule overflow-y-auto px-6">
                  {lines.map((line) => {
                    const key = lineKey(line)
                    return (
                      <li key={key} className="flex gap-4 py-5">
                        <div className="relative aspect-3/4 w-20 shrink-0 bg-bone">
                          <Image src={line.image} alt="" fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/shop/${line.slug}`}
                            onClick={close}
                            className="label-lg normal-case tracking-normal"
                          >
                            {line.name}
                          </Link>
                          <p className="mt-1 text-xs text-taupe">
                            {line.colour} · {line.size}
                            {line.madeToOrder ? ' · made to order' : ''}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center gap-3 border rule px-2 py-1">
                              <button
                                onClick={() => setQuantity(key, line.quantity - 1)}
                                aria-label={`Reduce quantity of ${line.name}`}
                                className="px-1 leading-none"
                              >
                                −
                              </button>
                              <span className="tabular-nums text-sm">{line.quantity}</span>
                              <button
                                onClick={() => setQuantity(key, line.quantity + 1)}
                                aria-label={`Increase quantity of ${line.name}`}
                                className="px-1 leading-none"
                              >
                                +
                              </button>
                            </div>
                            <p className="label tabular-nums">
                              {formatPrice(line.price * line.quantity)}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="border-t rule px-6 py-5">
                  {remaining > 0 ? (
                    <p className="mb-4 text-xs text-taupe">
                      {formatPrice(remaining)} more for free delivery in Greater Accra.
                    </p>
                  ) : (
                    <p className="mb-4 text-xs text-champagne-dim">
                      Free delivery in Greater Accra.
                    </p>
                  )}
                  <div className="mb-5 flex items-baseline justify-between">
                    <span className="label">Subtotal</span>
                    <span className="label-lg tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="label block bg-noir py-4 text-center text-ivory transition-colors hover:bg-jade"
                  >
                    Checkout
                  </Link>
                  <p className="mt-3 text-center text-xs text-taupe">
                    Cards, MTN MoMo, Telecel Cash & AT Money
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
