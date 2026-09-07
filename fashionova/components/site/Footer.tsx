import Link from 'next/link'
import type { SiteSettings } from '@/lib/types'
import { Marquee } from '@/components/anim/Marquee'
import { NewsletterForm } from '@/components/site/NewsletterForm'

export function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-noir pt-20 text-ivory">
      <Marquee text="FASHIONOVA" className="border-y rule py-4 text-mist/25" baseSpeed={0.5} />

      <div className="gutter grid gap-12 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <h2 className="text-section mb-6 max-w-sm">
            Made in Accra, worn everywhere.
          </h2>
          <NewsletterForm />
        </div>

        <div>
          <h3 className="label mb-5 text-champagne">Shop</h3>
          <ul className="space-y-2.5 text-mist">
            <li><Link href="/shop" className="link-underline">All pieces</Link></li>
            <li><Link href="/collections/harmattan" className="link-underline">Harmattan SS26</Link></li>
            <li><Link href="/lookbook" className="link-underline">Lookbook</Link></li>
            <li><Link href="/journal" className="link-underline">Journal</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="label mb-5 text-champagne">Atelier</h3>
          <ul className="space-y-2.5 text-mist">
            <li>{settings.studioAddress}</li>
            <li>
              <a href={`mailto:${settings.email}`} className="link-underline">
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                className="link-underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                className="link-underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="gutter flex flex-wrap items-center justify-between gap-4 border-t rule py-7">
        <p className="label text-mist/70">© {year} Fashionova</p>
        <p className="label text-mist/70">Prices in Ghana cedis · Cards & Mobile Money</p>
      </div>
    </footer>
  )
}
