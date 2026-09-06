import type { Metadata } from 'next'
import Link from 'next/link'
import { formatPrice, fromPesewas } from '@/lib/money'
import { paystack, paystackConfigured } from '@/lib/paystack'
import { ClearBagOnSuccess } from '@/components/shop/ClearBagOnSuccess'

export const metadata: Metadata = { title: 'Order', robots: { index: false } }

type Params = {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ demo?: string }>
}

interface Verification {
  status: string
  amount: number
  channel?: string
  customer?: { email?: string }
}

export default async function OrderPage({ params, searchParams }: Params) {
  const { reference } = await params
  const { demo } = await searchParams

  let paid = Boolean(demo)
  let amount: number | null = null
  let channel: string | undefined

  if (!demo && paystackConfigured) {
    try {
      const result = await paystack<Verification>(
        `/transaction/verify/${encodeURIComponent(reference)}`
      )
      paid = result.status && result.data?.status === 'success'
      amount = result.data?.amount ? fromPesewas(result.data.amount) : null
      channel = result.data?.channel
    } catch {
      paid = false
    }
  }

  return (
    <div className="gutter flex min-h-[70svh] max-w-2xl flex-col justify-center py-24">
      {paid ? <ClearBagOnSuccess /> : null}

      <span className="label mb-6 text-champagne-dim">
        {paid ? 'Payment received' : 'Payment pending'}
      </span>

      <h1 className="text-hero mb-8">
        {paid ? 'Thank you.' : 'We are still confirming this one.'}
      </h1>

      <p className="mb-8 text-graphite">
        {paid
          ? 'Your order is with the atelier. You will get an email confirmation, and we will message you on WhatsApp when it ships. Made-to-order pieces take seven to fourteen days.'
          : 'If you completed payment, it can take a moment to settle. Refresh this page, or send us the reference below on WhatsApp and we will check it for you.'}
      </p>

      <dl className="space-y-3 border-y rule py-6">
        <div className="flex justify-between gap-4">
          <dt className="label text-taupe">Reference</dt>
          <dd className="tabular-nums">{reference}</dd>
        </div>
        {amount !== null ? (
          <div className="flex justify-between gap-4">
            <dt className="label text-taupe">Amount</dt>
            <dd className="tabular-nums">{formatPrice(amount)}</dd>
          </div>
        ) : null}
        {channel ? (
          <div className="flex justify-between gap-4">
            <dt className="label text-taupe">Paid with</dt>
            <dd className="capitalize">{channel.replace('_', ' ')}</dd>
          </div>
        ) : null}
      </dl>

      {demo ? (
        <p className="mt-6 text-xs text-taupe">
          Test mode — no payment was taken. Add your Paystack keys to take real money.
        </p>
      ) : null}

      <Link href="/shop" className="label link-underline mt-10">
        Back to the collection
      </Link>
    </div>
  )
}
