import type { Metadata } from 'next'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/catalogue'
import { SplitHeading } from '@/components/anim/SplitHeading'
import { Marquee } from '@/components/anim/Marquee'

export const metadata: Metadata = {
  title: 'The Atelier',
  description:
    'Fashionova is nine tailors, one cutter and one finisher in Osu, Accra. We keep the whole chain — mill, dye house, atelier — inside Ghana.',
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <>
      <section className="gutter pb-16 pt-20 md:pb-24 md:pt-32">
        <span className="label mb-8 block text-champagne-dim">Accra, Ghana</span>
        <SplitHeading as="h1" mode="chars" className="text-display mb-10 uppercase">
          The Atelier
        </SplitHeading>
        <p className="max-w-2xl text-xl text-graphite" data-anim="left">
          It would be cheaper to cut in Asia. It would also mean the money leaves, the skills leave,
          and in ten years there is nobody in Osu who can set a sleeve. So we pay more per unit and
          we say so on the price tag.
        </p>
      </section>

      <div className="relative aspect-16/9 w-full" data-anim="scale" data-skew>
        <Image
          src="/img/editorial-atelier.svg"
          alt="The Fashionova atelier on Oxford Street, Osu"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <section className="gutter grid gap-12 py-24 md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="label sticky top-28 text-champagne-dim">How we work</h2>
        </div>
        <div className="space-y-12 md:col-span-7">
          {[
            {
              n: '01',
              title: 'Cloth first',
              body: 'Every season starts in Makola market, not on a sketchpad. We buy what we find, then work out what it wants to become. It means we never make the same collection twice, and it means when a cloth is gone, the piece is gone.',
            },
            {
              n: '02',
              title: 'Woven in Bonwire',
              body: 'Our kente comes from Kwame, who works a four-heddle loom in a compound outside Kumasi. The strips are four inches wide because the loom has not changed in three hundred years. Twelve days per ceremonial garment, before a stitch is sewn.',
            },
            {
              n: '03',
              title: 'Cut in Osu',
              body: 'Nine tailors, one cutter, one finisher, on Oxford Street. A kaftan takes three days. Made-to-order pieces are cut to your measurements — come in, or send them over WhatsApp.',
            },
            {
              n: '04',
              title: 'Priced honestly',
              body: 'The number on the tag is the cloth, the loom, the hours and a margin that keeps eleven people employed. No seasonal markdowns to create a fake sale later.',
            },
          ].map((step) => (
            <div key={step.n} className="border-b rule pb-10" data-anim="up">
              <span className="label mb-4 block text-taupe">{step.n}</span>
              <h3 className="mb-4 text-3xl">{step.title}</h3>
              <p className="max-w-xl text-graphite">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Marquee text="MADE IN ACCRA" className="border-y rule py-5 text-ink/10" baseSpeed={0.5} />

      <section className="gutter py-24">
        <SplitHeading as="h2" mode="lines" className="text-section mb-8 max-w-2xl">
          Come and see us
        </SplitHeading>
        <address className="not-italic text-graphite">
          <p>{settings.studioAddress}</p>
          <p className="mt-2">Monday to Saturday, 10:00 — 18:00</p>
          <p className="mt-6">
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
              WhatsApp
            </a>
          </p>
        </address>
      </section>
    </>
  )
}
