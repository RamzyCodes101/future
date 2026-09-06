import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { fromPesewas } from '@/lib/money'

/**
 * Paystack's server-to-server notification.
 *
 * The signature check is the whole point: the browser callback can be forged
 * by anyone who knows a reference, so an order is only ever marked paid from
 * here, after the HMAC matches.
 */
export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  const raw = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''
  const expected = createHmac('sha512', secret).update(raw).digest('hex')

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  }

  const event = JSON.parse(raw) as {
    event: string
    data: {
      reference: string
      amount: number
      channel?: string
      customer?: { email?: string }
      metadata?: Record<string, unknown>
    }
  }

  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const { data } = event
  const metadata = (data.metadata ?? {}) as {
    customerName?: string
    phone?: string
    address?: string
    shippingZone?: string
    lines?: Array<Record<string, unknown>>
  }

  if (client) {
    try {
      // createIfNotExists keyed on the reference makes a replayed webhook a
      // no-op rather than a duplicate order.
      await client
        .withConfig({ token: process.env.SANITY_API_READ_TOKEN })
        .createIfNotExists({
          _id: `order-${data.reference}`,
          _type: 'order',
          reference: data.reference,
          email: data.customer?.email,
          customerName: metadata.customerName,
          phone: metadata.phone,
          address: metadata.address,
          shippingZone: metadata.shippingZone,
          channel: data.channel,
          total: fromPesewas(data.amount),
          status: 'paid',
          lines: metadata.lines ?? [],
          placedAt: new Date().toISOString(),
        })
    } catch (error) {
      // Never 500 back to Paystack for a CMS problem — it retries, and the
      // payment itself already succeeded. Log it and move on.
      console.error('[paystack] could not record order in Sanity:', error)
    }
  } else {
    console.info('[paystack] paid order (no CMS configured):', data.reference)
  }

  return NextResponse.json({ received: true })
}
