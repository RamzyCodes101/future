import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'

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

      <form className="space-y-7" data-anim="right">
        {[
          { id: 'name', label: 'Your name', type: 'text' },
          { id: 'email', label: 'Email', type: 'email' },
          { id: 'phone', label: 'Phone (optional)', type: 'tel' },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="label mb-2.5 block text-taupe">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              required={field.id !== 'phone'}
              className="w-full border-b rule bg-transparent pb-2.5 focus:border-ink focus:outline-none"
            />
          </div>
        ))}
        <div>
          <label htmlFor="message" className="label mb-2.5 block text-taupe">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full border-b rule bg-transparent pb-2.5 focus:border-ink focus:outline-none"
          />
        </div>
        <button type="submit" className="label w-full bg-noir py-4 text-ivory transition-colors hover:bg-jade">
          Send
        </button>
        <p className="text-xs text-taupe">
          Connect a form handler (Resend, Formspree) before launch — this form is not wired up yet.
        </p>
      </form>
    </div>
  )
}
