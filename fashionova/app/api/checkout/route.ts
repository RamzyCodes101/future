import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProducts, getSiteSettings } from '@/lib/catalogue'
import { toPesewas } from '@/lib/money'
import { orderReference, paystack, paystackConfigured, PAYSTACK_CHANNELS } from '@/lib/paystack'

const schema = z.object({
  email: z.email(),
  name: z.string().min(2).max(120),
  phone: z.string().min(9).max(20),
  address: z.string().min(6).max(500),
  zone: z.string().min(1).max(80),
  lines: z
    .array(
      z.object({
        slug: z.string().min(1),
        size: z.string().min(1),
        colour: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(40),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check the details and try again.' }, { status: 400 })
  }

  const { email, name, phone, address, zone, lines } = parsed.data
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()])

  // Prices are recomputed from the catalogue, never taken from the request.
  // Otherwise anyone can post their own price and pay 1 cedi for an agbada.
  let subtotal = 0
  const resolved = []

  for (const line of lines) {
    const product = products.find((p) => p.slug === line.slug)
    if (!product || product.status !== 'active') {
      return NextResponse.json(
        { error: `"${line.slug}" is no longer available.` },
        { status: 409 }
      )
    }

    const variant = product.variants.find(
      (v) => v.size === line.size && v.colour === line.colour
    )
    if (!variant) {
      return NextResponse.json({ error: `That size is no longer listed.` }, { status: 409 })
    }
    if (!product.madeToOrder && variant.stock < line.quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stock} left of ${product.name} in ${line.size}.` },
        { status: 409 }
      )
    }

    subtotal += product.price * line.quantity
    resolved.push({
      name: product.name,
      slug: product.slug,
      size: line.size,
      colour: line.colour,
      quantity: line.quantity,
      price: product.price,
    })
  }

  const shippingZone = settings.shippingZones.find((z) => z.label === zone)
  if (!shippingZone) {
    return NextResponse.json({ error: 'Choose a delivery area.' }, { status: 400 })
  }

  const isAccra = shippingZone.label.toLowerCase().includes('accra')
  const shipping =
    isAccra && subtotal >= settings.freeShippingThreshold ? 0 : shippingZone.rate
  const total = subtotal + shipping
  const reference = orderReference()

  if (!paystackConfigured) {
    // Lets the whole flow be walked through before Paystack keys exist.
    return NextResponse.json({
      reference,
      total,
      testMode: true,
      authorizationUrl: `/order/${reference}?demo=1`,
    })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin

  const result = await paystack<{ authorization_url: string; reference: string }>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        amount: toPesewas(total),
        currency: 'GHS',
        reference,
        channels: PAYSTACK_CHANNELS,
        callback_url: `${origin}/order/${reference}`,
        metadata: {
          customerName: name,
          phone,
          address,
          shippingZone: shippingZone.label,
          shipping,
          subtotal,
          lines: resolved,
        },
      }),
    }
  )

  if (!result.status) {
    return NextResponse.json({ error: result.message }, { status: 502 })
  }

  return NextResponse.json({
    reference: result.data.reference,
    total,
    authorizationUrl: result.data.authorization_url,
  })
}
