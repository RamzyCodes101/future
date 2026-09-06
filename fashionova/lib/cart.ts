'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine } from './types'

interface CartState {
  lines: CartLine[]
  isOpen: boolean
  add: (line: CartLine) => void
  remove: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
  count: () => number
  subtotal: () => number
}

/** A line is identified by product + size + colour, not product alone. */
export const lineKey = (line: Pick<CartLine, 'productId' | 'size' | 'colour'>) =>
  `${line.productId}::${line.size}::${line.colour}`

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,

      add: (line) =>
        set((state) => {
          const key = lineKey(line)
          const existing = state.lines.find((l) => lineKey(l) === key)
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                lineKey(l) === key ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
            }
          }
          return { isOpen: true, lines: [...state.lines, line] }
        }),

      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => lineKey(l) !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => lineKey(l) !== key)
              : state.lines.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)),
        })),

      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((n, l) => n + l.price * l.quantity, 0),
    }),
    {
      name: 'fashionova-bag',
      // The drawer should never be open on first paint after a reload.
      partialize: (state) => ({ lines: state.lines }) as CartState,
    }
  )
)
