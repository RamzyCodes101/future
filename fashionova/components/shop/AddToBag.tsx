'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/money'
import type { Product } from '@/lib/types'

export function AddToBag({ product }: { product: Product }) {
  const colours = Array.from(new Set(product.variants.map((v) => v.colour)))
  const [colour, setColour] = useState(colours[0] ?? '')
  const [size, setSize] = useState('')
  const [error, setError] = useState('')
  const add = useCart((s) => s.add)

  const sizesFor = product.variants.filter((v) => v.colour === colour)
  const selected = sizesFor.find((v) => v.size === size)
  const available = product.madeToOrder || (selected ? selected.stock > 0 : false)

  const submit = () => {
    if (!size) {
      setError('Choose a size first')
      return
    }
    setError('')
    add({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0].url,
      size,
      colour,
      quantity: 1,
      madeToOrder: product.madeToOrder,
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-baseline gap-4">
        <p className="text-2xl tabular-nums">{formatPrice(product.price)}</p>
        {product.compareAtPrice ? (
          <p className="text-taupe line-through tabular-nums">
            {formatPrice(product.compareAtPrice)}
          </p>
        ) : null}
      </div>

      {colours.length > 1 ? (
        <fieldset className="mb-7">
          <legend className="label mb-3 text-taupe">Colour — {colour}</legend>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColour(c)
                  setSize('')
                }}
                aria-pressed={c === colour}
                className={`label border px-4 py-2.5 transition-colors ${
                  c === colour ? 'border-ink bg-ink text-ivory' : 'rule hover:border-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="mb-7">
        <legend className="label mb-3 text-taupe">Size</legend>
        <div className="flex flex-wrap gap-2">
          {sizesFor.map((v) => {
            const soldOut = !product.madeToOrder && v.stock === 0
            return (
              <button
                key={v._key}
                onClick={() => {
                  setSize(v.size)
                  setError('')
                }}
                disabled={soldOut}
                aria-pressed={v.size === size}
                className={`label min-w-14 border px-4 py-2.5 transition-colors ${
                  v.size === size ? 'border-ink bg-ink text-ivory' : 'rule hover:border-ink'
                } ${soldOut ? 'cursor-not-allowed text-taupe/50 line-through' : ''}`}
              >
                {v.size}
              </button>
            )
          })}
        </div>
        {selected && !product.madeToOrder && selected.stock > 0 && selected.stock <= 2 ? (
          <p className="mt-3 text-xs text-oxblood">
            Only {selected.stock} left in {selected.size}
          </p>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" className="mb-4 text-xs text-oxblood">
          {error}
        </p>
      ) : null}

      <button
        onClick={submit}
        disabled={!available && Boolean(size)}
        className="label w-full bg-noir py-4.5 text-ivory transition-colors hover:bg-jade disabled:cursor-not-allowed disabled:bg-taupe"
      >
        {!available && size ? 'Sold out' : 'Add to bag'}
      </button>

      {product.madeToOrder ? (
        <p className="mt-4 text-xs text-graphite">
          Made to order — sewn to your measurements and dispatched in 7–14 days.
        </p>
      ) : null}
    </div>
  )
}
