import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { formatPrice, fromPesewas } from '@/lib/money'
import { emailLayout, sendEmail } from '@/lib/email'

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

  // Confirmation to the customer. A failure here must not fail the webhook —
  // the money has already moved, and Paystack would retry a non-2xx forever.
  const customerEmail = data.customer?.email
  if (customerEmail) {
    const lines = (metadata.lines ?? []) as Array<{
      name?: string
      size?: string
      colour?: string
      quantity?: number
      price?: number
    }>

    const rows = lines
      .map(
        (line) => `<tr>
          <td style="padding:8px 0;font-size:14px">${line.name ?? ''}<br>
            <span style="color:#9a8b79;font-size:12px">${line.colour ?? ''} · ${line.size ?? ''} · ×${line.quantity ?? 1}</span>
          </td>
          <td style="padding:8px 0;font-size:14px;text-align:right;white-space:nowrap">${formatPrice((line.price ?? 0) * (line.quantity ?? 1))}</td>
        </tr>`
      )
      .join('')

    const madeToOrder = lines.some((line) => String(line.name ?? '').length > 0)

    await sendEmail({
      to: customerEmail,
      subject: `Your Fashionova order — ${data.reference}`,
      html: emailLayout(
        'Thank you.',
        `<p style="margin:0 0 24px;font-size:15px;line-height:1.6">
           Your order is with the atelier. We will message you on WhatsApp when it ships.
           ${madeToOrder ? 'Made-to-order pieces are dispatched in 7–14 days.' : ''}
         </p>
         <table width="100%" cellpadding="0" cellspacing="0"
                style="border-top:1px solid #dcd4c7;border-bottom:1px solid #dcd4c7">
           ${rows}
         </table>
         <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
           <tr>
             <td style="font-size:15px"><strong>Total</strong></td>
             <td style="font-size:15px;text-align:right"><strong>${formatPrice(fromPesewas(data.amount))}</strong></td>
           </tr>
         </table>
         <p style="margin:28px 0 0;font-size:12px;color:#9a8b79">
           Reference ${data.reference} — quote this if you get in touch.
         </p>`
      ),
    })
  }

  return NextResponse.json({ received: true })
}
