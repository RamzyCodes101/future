'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice } from '@/lib/money'
import type { Product } from '@/lib/types'

/**
 * The card swaps to the second photograph on hover — the single most useful
 * interaction on a fashion grid, and one no amount of scroll animation
 * replaces.
 */
export function ProductCard({
  product,
  priority = false,
  index = 0,
}: {
  product: Product
  priority?: boolean
  index?: number
}) {
  const [hovered, setHovered] = useState(false)
  const primary = product.images[0]
  const secondary = product.images[1] ?? primary
  const soldOut =
    !product.madeToOrder && !(product.variants ?? []).some((v) => v.stock > 0)

  return (
    <article data-anim="up" data-skew style={{ ['--i' as string]: index }}>
      <Link
        href={`/shop/${product.slug}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-3/4 overflow-hidden bg-bone">
          <Image
            src={primary.url}
            alt={primary.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            placeholder={primary.lqip ? 'blur' : undefined}
            blurDataURL={primary.lqip}
            className={`object-cover transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
          <Image
            src={secondary.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hovered ? 'scale-105 opacity-100' : 'scale-110 opacity-0'
            }`}
          />

          {product.compareAtPrice ? (
            <span className="label absolute left-3 top-3 bg-ivory px-2.5 py-1.5 text-ink">
              Sale
            </span>
          ) : null}
          {product.madeToOrder ? (
            <span className="label absolute left-3 top-3 bg-noir px-2.5 py-1.5 text-ivory">
              Made to order
            </span>
          ) : null}
          {soldOut ? (
            <span className="label absolute inset-x-3 bottom-3 bg-noir/85 py-2 text-center text-ivory">
              Sold out
            </span>
          ) : null}
        </div>

        <div className="flex items-baseline justify-between gap-4 pt-3.5">
          <h3 className="label-lg font-normal normal-case tracking-normal">{product.name}</h3>
          <p className="label shrink-0 tabular-nums">
            {product.compareAtPrice ? (
              <span className="mr-2 text-taupe line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="mt-1 text-xs text-taupe">{product.category?.title}</p>
      </Link>
    </article>
  )
}
