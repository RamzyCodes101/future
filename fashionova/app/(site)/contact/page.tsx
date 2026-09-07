import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'
import { ContactForm } from '@/components/site/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Visit the Fashionova atelier in Osu, Accra, or reach us on WhatsApp.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="gutter grid gap-16 pb-28 pt-20 md:grid-cols-2">
      <div>
        <SplitHeading as="h1" mode="chars" className="text-hero mb-10">
          Contact
        </SplitHeading>
        <address className="not-italic text-graphite" data-anim="left">
          <p className="label mb-3 text-champagne-dim">Atelier</p>
          <p>{settings.studioAddress}</p>
          <p className="mt-1">Monday to Saturday, 10:00 — 18:00</p>

          <p className="label mb-3 mt-10 text-champagne-dim">Reach us</p>
          <p>
            <a href={`mailto:${settings.email}`} className="link-underline">
              {settings.email}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              WhatsApp — fastest reply
            </a>
          </p>
        </address>
      </div>

      <ContactForm />
    </div>
  )
}
