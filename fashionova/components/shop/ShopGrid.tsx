'use client'

import { useRef, useState } from 'react'
import { Flip, gsap, prefersReducedMotion } from '@/lib/gsap'
import { ProductCard } from './ProductCard'
import type { Category, Product } from '@/lib/types'

type Sort = 'featured' | 'price-asc' | 'price-desc'

/**
 * Filtering with GSAP Flip.
 *
 * Flip records the grid's geometry before React re-renders, then animates
 * every surviving card from where it was to where it now is. Without it the
 * grid teleports on every filter click, which is the single most jarring
 * moment on a shop page.
 */
export function ShopGrid({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [category, setCategory] = useState<string>('all')
  const [sort, setSort] = useState<Sort>('featured')
  const grid = useRef<HTMLDivElement>(null)

  const apply = (next: () => void) => {
    if (prefersReducedMotion() || !grid.current) {
      next()
      return
    }

    const state = Flip.getState(grid.current.querySelectorAll('[data-flip]'))
    next()

    // One frame for React to commit the new DOM before Flip measures it.
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.7,
        ease: 'expo.out',
        stagger: 0.025,
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.35 }),
      })
    })
  }

  const visible = products
    .filter((p) => category === 'all' || p.category?.slug === category)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return Number(b.featured) - Number(a.featured)
    })

  return (
    <>
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b rule pb-5">
        <div className="flex flex-wrap gap-x-6 gap-y-3" role="group" aria-label="Filter by category">
          <button
            onClick={() => apply(() => setCategory('all'))}
            aria-pressed={category === 'all'}
            className={`label link-underline ${category === 'all' ? 'text-champagne-dim' : 'text-taupe'}`}
          >
            All ({products.length})
          </button>
          {categories.map((c) => {
            const n = products.filter((p) => p.category?.slug === c.slug).length
            if (n === 0) return null
            return (
              <button
                key={c._id}
                onClick={() => apply(() => setCategory(c.slug))}
                aria-pressed={category === c.slug}
                className={`label link-underline ${
                  category === c.slug ? 'text-champagne-dim' : 'text-taupe'
                }`}
              >
                {c.title} ({n})
              </button>
            )
          })}
        </div>

        <label className="label flex items-center gap-3 text-taupe">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => apply(() => setSort(e.target.value as Sort))}
            className="label border-b rule bg-transparent py-1 text-ink focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>

      <div ref={grid} className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4">
        {visible.map((product, i) => (
          <div key={product._id} data-flip>
            <ProductCard product={product} index={i} priority={i < 4} />
          </div>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-taupe">Nothing in this category yet.</p>
      ) : null}
    </>
  )
}
