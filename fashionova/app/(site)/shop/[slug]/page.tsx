import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getProducts, getRelatedProducts, getSiteSettings } from '@/lib/catalogue'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { AddToBag } from '@/components/shop/AddToBag'
import { ProductCard } from '@/components/shop/ProductCard'
import { SplitHeading } from '@/components/anim/SplitHeading'
import { ProductViewer } from '@/components/three/ProductViewer'
import { SizeGuide } from '@/components/shop/SizeGuide'
import { formatPrice } from '@/lib/money'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Not found' }

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product || product.status === 'archived') notFound()

  const [related, settings] = await Promise.all([
    getRelatedProducts(product),
    getSiteSettings(),
  ])

  const enquiry = encodeURIComponent(
    `Hello Fashionova — I'd like to ask about the ${product.name} (${formatPrice(product.price)}).`
  )

  // Product schema for search results, built from live CMS values so a price
  // change in the Studio also updates what Google shows.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    material: product.fabric,
    brand: { '@type': 'Brand', name: 'Fashionova' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: product.price,
      availability: product.variants.some((v) => v.stock > 0) || product.madeToOrder
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="gutter pt-10">
        <nav aria-label="Breadcrumb" className="label mb-10 flex gap-2 text-taupe">
          <Link href="/shop" className="link-underline">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span>{product.category?.title}</span>
        </nav>
      </div>

      <article className="gutter grid gap-12 pb-24 md:grid-cols-2 md:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="md:py-6">
          <SplitHeading as="h1" mode="lines" className="text-hero mb-6">
            {product.name}
          </SplitHeading>

          <AddToBag product={product} />

          <a
            href={`https://wa.me/${settings.whatsappNumber}?text=${enquiry}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label mt-4 block w-full border rule py-4 text-center transition-colors hover:border-ink"
          >
            Ask about this piece on WhatsApp
          </a>

          <div className="mt-12 space-y-8 border-t rule pt-10">
            <div data-anim="up">
              <h2 className="label mb-3 text-champagne-dim">Description</h2>
              <p className="text-graphite">{product.description}</p>
            </div>
            <div data-anim="up">
              <h2 className="label mb-3 text-champagne-dim">Fabric</h2>
              <p className="text-graphite">{product.fabric}</p>
            </div>
            <div data-anim="up">
              <h2 className="label mb-3 text-champagne-dim">Care</h2>
              <p className="text-graphite">{product.careInstructions}</p>
            </div>
            <div data-anim="up">
              <h2 className="label mb-3 text-champagne-dim">Sizing</h2>
              <SizeGuide />
            </div>
            <div data-anim="up">
              <h2 className="label mb-3 text-champagne-dim">Delivery</h2>
              <ul className="space-y-1.5 text-graphite">
                {settings.shippingZones.map((zone) => (
                  <li key={zone._key} className="flex justify-between gap-6 border-b rule pb-1.5">
                    <span>{zone.label}</span>
                    <span className="tabular-nums">{formatPrice(zone.rate)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-taupe">
                Free within Greater Accra over {formatPrice(settings.freeShippingThreshold)}.
              </p>
            </div>
          </div>
        </div>
      </article>

      {product.model3d ? <ProductViewer src={product.model3d} name={product.name} /> : null}

      {related.length > 0 ? (
        <section className="gutter border-t rule py-20">
          <SplitHeading as="h2" mode="chars" className="text-section mb-12">
            Styled with
          </SplitHeading>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
