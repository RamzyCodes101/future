import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getJournal } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes from the Fashionova atelier — cloth, looms, dye vats and making clothes in Accra.',
}

export default async function JournalPage() {
  const posts = await getJournal()

  return (
    <div className="gutter pb-24 pt-20">
      <SplitHeading as="h1" mode="chars" className="text-hero mb-16">
        Journal
      </SplitHeading>

      <div className="space-y-px">
        {posts.map((post, i) => (
          <Link
            key={post._id}
            href={`/journal/${post.slug}`}
            className="group grid gap-6 border-t rule py-10 md:grid-cols-12 md:items-center"
            data-anim={i % 2 === 0 ? 'left' : 'right'}
          >
            <div className="relative aspect-16/10 md:col-span-4" data-skew>
              <Image
                src={post.image.url}
                alt={post.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <span className="label mb-3 block text-champagne-dim">
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <h2 className="mb-3 text-3xl md:text-4xl">{post.title}</h2>
              <p className="max-w-xl text-graphite">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
