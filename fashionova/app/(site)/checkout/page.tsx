import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/catalogue'
import { CheckoutForm } from '@/components/shop/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function CheckoutPage() {
  const settings = await getSiteSettings()

  return (
    <div className="gutter pb-28 pt-16">
      <h1 className="text-hero mb-12">Checkout</h1>
      <CheckoutForm
        zones={settings.shippingZones}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
    </div>
  )
}
