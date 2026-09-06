'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { lineKey, useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/money'
import type { ShippingZone } from '@/lib/types'

export function CheckoutForm({
  zones,
  freeShippingThreshold,
}: {
  zones: ShippingZone[]
  freeShippingThreshold: number
}) {
  const { lines, subtotal, clear } = useCart()
  const router = useRouter()
  const [zone, setZone] = useState(zones[0]?.label ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const goods = subtotal()
  const selectedZone = zones.find((z) => z.label === zone)
  const isAccra = zone.toLowerCase().includes('accra')
  const shipping =
    isAccra && goods >= freeShippingThreshold ? 0 : (selectedZone?.rate ?? 0)
  const total = goods + shipping

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-6 text-taupe">Your bag is empty.</p>
        <Link href="/shop" className="label link-underline">
          Browse the collection
        </Link>
      </div>
    )
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          name: form.get('name'),
          phone: form.get('phone'),
          address: form.get('address'),
          zone,
          lines: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            colour: l.colour,
            quantity: l.quantity,
          })),
        }),
      })

      const data = (await response.json()) as {
        authorizationUrl?: string
        error?: string
        testMode?: boolean
      }

      if (!response.ok || !data.authorizationUrl) {
        setError(data.error ?? 'Something went wrong. Try again.')
        setBusy(false)
        return
      }

      if (data.testMode) {
        clear()
        router.push(data.authorizationUrl)
        return
      }

      // Paystack hosts the payment page — mobile money flows need it.
      window.location.href = data.authorizationUrl
    } catch {
      setError('We could not reach the payment service. Check your connection.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-14 md:grid-cols-2 md:gap-20">
      <div className="space-y-7">
        <h2 className="label text-champagne-dim">Your details</h2>

        {[
          { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
          { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          { id: 'phone', label: 'Phone (the number your MoMo is on)', type: 'tel', autoComplete: 'tel' },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="label mb-2.5 block text-taupe">
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              className="w-full border-b rule bg-transparent pb-2.5 focus:border-ink focus:outline-none"
            />
          </div>
        ))}

        <div>
          <label htmlFor="address" className="label mb-2.5 block text-taupe">
            Delivery address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            autoComplete="street-address"
            placeholder="Street, area, and a landmark — it helps the rider find you"
            className="w-full border-b rule bg-transparent pb-2.5 placeholder:text-taupe/60 focus:border-ink focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="label mb-3 text-taupe">Delivery area</legend>
          <div className="space-y-2.5">
            {zones.map((z) => (
              <label key={z._key} className="flex cursor-pointer items-center justify-between gap-4 border-b rule pb-2.5">
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="zone"
                    value={z.label}
                    checked={zone === z.label}
                    onChange={() => setZone(z.label)}
                    className="accent-[#c6a664]"
                  />
                  {z.label}
                </span>
                <span className="label tabular-nums">
                  {z.label.toLowerCase().includes('accra') && goods >= freeShippingThreshold
                    ? 'Free'
                    : formatPrice(z.rate)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <h2 className="label mb-6 text-champagne-dim">Your order</h2>

        <ul className="divide-y rule border-y rule">
          {lines.map((line) => (
            <li key={lineKey(line)} className="flex gap-4 py-4">
              <div className="relative aspect-3/4 w-16 shrink-0 bg-bone">
                <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="label-lg normal-case tracking-normal">{line.name}</p>
                <p className="mt-1 text-xs text-taupe">
                  {line.colour} · {line.size} · ×{line.quantity}
                </p>
              </div>
              <p className="label tabular-nums">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2.5">
          <div className="flex justify-between">
            <dt className="text-graphite">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(goods)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-graphite">Delivery</dt>
            <dd className="tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t rule pt-3 text-lg">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(total)}</dd>
          </div>
        </dl>

        {error ? (
          <p role="alert" className="mt-5 text-sm text-oxblood">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="label mt-7 w-full bg-noir py-4.5 text-ivory transition-colors hover:bg-jade disabled:bg-taupe"
        >
          {busy ? 'Taking you to payment…' : `Pay ${formatPrice(total)}`}
        </button>

        <p className="mt-4 text-center text-xs text-taupe">
          Pay with MTN MoMo, Telecel Cash, AT Money or card. Payment is handled by Paystack —
          we never see your card or wallet details.
        </p>
      </div>
    </form>
  )
}
