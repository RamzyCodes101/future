'use client'

import { useActionState } from 'react'
import { contact, type FormState } from '@/app/(site)/actions'

const initial: FormState = { status: 'idle', message: '' }

const fields = [
  { id: 'name', label: 'Your name', type: 'text', autoComplete: 'name', required: true },
  { id: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
  { id: 'phone', label: 'Phone (optional)', type: 'tel', autoComplete: 'tel', required: false },
]

export function ContactForm() {
  const [state, action, pending] = useActionState(contact, initial)

  if (state.status === 'ok') {
    return (
      <div role="status" className="border-t rule pt-10">
        <p className="text-section mb-4">Thank you.</p>
        <p className="text-graphite">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-7" data-anim="right">
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="label mb-2.5 block text-taupe">
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            autoComplete={field.autoComplete}
            required={field.required}
            defaultValue={state.values?.[field.id] ?? ''}
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
          defaultValue={state.values?.message ?? ''}
          className="w-full border-b rule bg-transparent pb-2.5 focus:border-ink focus:outline-none"
        />
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-oxblood">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="label w-full bg-noir py-4 text-ivory transition-colors hover:bg-jade disabled:bg-taupe"
      >
        {pending ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}
