import type { Metadata } from 'next'
import { getCategories, getProducts } from '@/lib/catalogue'
import { ShopGrid } from '@/components/shop/ShopGrid'
import { SplitHeading } from '@/components/anim/SplitHeading'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'The full Fashionova collection — kaftans, two-piece sets, ceremonial boubou and agbada, wrappers and headwear. Cut and sewn in Accra.',
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div className="gutter pb-28 pt-16 md:pt-24">
      <header className="mb-14 max-w-2xl">
        <span className="label mb-6 block text-champagne-dim">
          {products.length} pieces · Harmattan SS26
        </span>
        <SplitHeading as="h1" mode="chars" className="text-hero mb-6">
          The Collection
        </SplitHeading>
        <p className="text-graphite">
          Everything is cut in our Osu atelier. Pieces marked made-to-order are sewn to your
          measurements and take seven to fourteen days.
        </p>
      </header>

      <ShopGrid products={products} categories={categories} />
    </div>
  )
}
