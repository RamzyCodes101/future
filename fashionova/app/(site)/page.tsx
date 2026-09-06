import Image from 'next/image'
import Link from 'next/link'
import { getCollections, getFeaturedProducts, getJournal, getProducts } from '@/lib/catalogue'
import { formatPrice } from '@/lib/money'
import { Hero } from '@/components/site/Hero'
import { SplitHeading } from '@/components/anim/SplitHeading'
import { HorizontalRail } from '@/components/anim/HorizontalRail'
import { StickyLookbook } from '@/components/anim/StickyLookbook'
import { Marquee } from '@/components/anim/Marquee'
import { ProductCard } from '@/components/shop/ProductCard'

export default async function HomePage() {
  const [featured, products, collections, journal] = await Promise.all([
    getFeaturedProducts(5),
    getProducts(),
    getCollections(),
    getJournal(),
  ])

  const collection = collections[0]
  const grid = products.slice(0, 8)

  return (
    <>
      <Hero
        season={collection?.season ?? 'SS26'}
        standfirst="A contemporary fashion house in Accra. Wax print, hand-woven kente and naturally dyed adire, cut and sewn in Osu."
      />

      {/* Standfirst — arrives from the left against a right-hand image. */}
      <section className="gutter grid gap-12 py-24 md:grid-cols-12 md:py-36">
        <div className="md:col-span-5 md:col-start-1" data-anim="left">
          <span className="label mb-6 block text-champagne-dim">The house</span>
          <SplitHeading as="h2" mode="lines" className="text-section mb-8">
            {collection?.standfirst ??
              'Clothes built for the light in Accra, and for everywhere that light travels.'}
          </SplitHeading>
          <Link href="/about" className="label link-underline">
            Inside the atelier
          </Link>
        </div>
        <div className="relative aspect-4/5 md:col-span-6 md:col-start-7" data-anim="right" data-skew>
          <Image
            src="/img/editorial-atelier.svg"
            alt="The Osu atelier, a garment on the stand"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Pinned horizontal rail. */}
      <section className="relative overflow-hidden bg-noir py-20 text-ivory md:py-0">
        <div className="gutter flex items-end justify-between pb-10 md:pt-24">
          <SplitHeading as="h2" mode="chars" className="text-section">
            Featured
          </SplitHeading>
          <Link href="/shop" className="label link-underline shrink-0">
            All pieces
          </Link>
        </div>

        <HorizontalRail className="md:h-[100svh] md:flex md:items-center">
          {featured.map((product) => (
            <Link
              key={product._id}
              href={`/shop/${product.slug}`}
              data-rail-card
              className="group w-[74vw] shrink-0 sm:w-[42vw] lg:w-[26vw]"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-ink">
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt}
                  fill
                  sizes="(max-width: 640px) 74vw, (max-width: 1024px) 42vw, 26vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-4">
                <h3 className="label-lg normal-case tracking-normal">{product.name}</h3>
                <p className="label shrink-0 tabular-nums text-champagne">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalRail>
      </section>

      <Marquee
        text="HARMATTAN SS26"
        className="border-y rule bg-ivory py-5 text-ink/15"
        baseSpeed={0.7}
      />

      {/* Sticky lookbook — pinned media, scrolling copy. */}
      <StickyLookbook
        panels={[
          {
            image: '/img/editorial-fabric.svg',
            alt: 'Wax print cloth, folded',
            eyebrow: 'Cloth',
            title: 'We buy the fabric first',
            body: 'Every season starts in Makola, not on a sketchpad. We find the cloth, then work out what it wants to become. It is a slower way to design and it means we never make the same collection twice.',
          },
          {
            image: '/img/editorial-atelier.svg',
            alt: 'A tailor setting a sleeve',
            eyebrow: 'Cut',
            title: 'Nine people in Osu',
            body: 'Nine tailors, one cutter, one finisher. A kaftan takes three days; a ceremonial agbada takes three weeks, twelve of those days on a loom in Bonwire before a single stitch is sewn.',
          },
          {
            image: '/img/editorial-accra.svg',
            alt: 'Accra street, model in an oxblood boubou',
            eyebrow: 'Worn',
            title: 'Built for the harmattan',
            body: 'Open weaves, deep vents, nothing lined that does not need to be. These are clothes for thirty-four degrees and dust in the air, that happen also to work in a London winter under a coat.',
          },
        ]}
      />

      {/* The grid — staggered up-entrance with velocity skew. */}
      <section className="gutter py-24 md:py-32">
        <div className="mb-12 flex items-end justify-between border-b rule pb-6">
          <SplitHeading as="h2" mode="chars" className="text-section">
            New in
          </SplitHeading>
          <Link href="/shop" className="label link-underline shrink-0">
            Shop all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4">
          {grid.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* Journal — centre-out scale entrance. */}
      <section className="gutter border-t rule py-24">
        <SplitHeading as="h2" mode="chars" className="text-section mb-12">
          Journal
        </SplitHeading>
        <div className="grid gap-10 md:grid-cols-3">
          {journal.slice(0, 3).map((post) => (
            <Link key={post._id} href={`/journal/${post.slug}`} data-anim="scale" className="group">
              <div className="relative mb-5 aspect-16/10 overflow-hidden bg-bone">
                <Image
                  src={post.image.url}
                  alt={post.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <span className="label mb-3 block text-champagne-dim">
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <h3 className="mb-2 text-2xl">{post.title}</h3>
              <p className="text-sm text-graphite">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
