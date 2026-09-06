'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { ProductImage } from '@/lib/types'

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div className="md:sticky md:top-24">
      <div className="relative aspect-3/4 overflow-hidden bg-bone" data-anim="scale">
        <Image
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder={current.lqip ? 'blur' : undefined}
          blurDataURL={current.lqip}
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-3" role="group" aria-label={`${name} photographs`}>
          {images.map((image, i) => (
            <button
              key={image.url}
              onClick={() => setActive(i)}
              aria-label={`View photograph ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-3/4 w-20 overflow-hidden bg-bone transition-opacity ${
                i === active ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
