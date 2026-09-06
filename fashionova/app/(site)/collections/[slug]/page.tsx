import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCollection, getCollections, getProducts } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'
import { HorizontalRail } from '@/components/anim/HorizontalRail'
import { ProductCard } from '@/components/shop/ProductCard'
import { formatPrice } from '@/lib/money'
import Link from 'next/link'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug)
  if (!collection) return { title: 'Not found' }
  return { title: `${collection.title} ${collection.season}`, description: collection.standfirst }
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params
  const [collection, products] = await Promise.all([getCollection(slug), getProducts()])
  if (!collection) notFound()

  const inCollection = collection.productSlugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <section className="relative h-[85svh] min-h-[520px] overflow-hidden bg-noir text-ivory">
        <Image
          src={collection.heroImage.url}
          alt={collection.heroImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="gutter absolute inset-0 flex flex-col justify-end pb-16">
          <span className="label mb-6 block text-champagne">{collection.season}</span>
          <SplitHeading as="h1" mode="chars" className="text-display uppercase">
            {collection.title}
          </SplitHeading>
        </div>
      </section>

      <section className="gutter grid gap-10 py-24 md:grid-cols-12">
        <p className="text-xl text-graphite md:col-span-7 md:col-start-6" data-anim="right">
          {collection.standfirst}
        </p>
      </section>

      <section className="overflow-hidden bg-jade py-16 text-ivory md:py-0">
        <HorizontalRail className="md:flex md:h-[100svh] md:items-center">
          {inCollection.map((product) => (
            <Link
              key={product._id}
              href={`/shop/${product.slug}`}
              data-rail-card
              className="group w-[74vw] shrink-0 sm:w-[42vw] lg:w-[28vw]"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-noir">
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt}
                  fill
                  sizes="(max-width: 640px) 74vw, (max-width: 1024px) 42vw, 28vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-4">
                <h2 className="label-lg normal-case tracking-normal">{product.name}</h2>
                <p className="label shrink-0 tabular-nums text-champagne">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalRail>
      </section>

      <section className="gutter py-24">
        <SplitHeading as="h2" mode="chars" className="text-section mb-12">
          The full run
        </SplitHeading>
        <div className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4">
          {inCollection.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </section>
    </>
  )
}
