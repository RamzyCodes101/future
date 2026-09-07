'use client'

import { useActionState } from 'react'
import { subscribe, type FormState } from '@/app/(site)/actions'

const initial: FormState = { status: 'idle', message: '' }

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, initial)

  return (
    <div>
      <form action={action} className="flex max-w-sm items-center gap-4 border-b rule pb-3">
        <label htmlFor="newsletter" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email ?? ''}
          placeholder="Email address"
          aria-describedby="newsletter-status"
          className="w-full bg-transparent text-ivory placeholder:text-mist/70 focus:outline-none"
        />
        <button type="submit" disabled={pending} className="label shrink-0 text-champagne disabled:opacity-50">
          {pending ? '…' : 'Join'}
        </button>
      </form>

      <p
        id="newsletter-status"
        role="status"
        className={`mt-3 text-xs ${
          state.status === 'error' ? 'text-champagne' : 'text-mist/70'
        }`}
      >
        {state.status === 'idle'
          ? 'New collections and atelier notes. No more than once a month.'
          : state.message}
      </p>
    </div>
  )
}
