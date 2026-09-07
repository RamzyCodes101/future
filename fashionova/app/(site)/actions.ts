'use server'

import { z } from 'zod'
import { emailLayout, sendEmail } from '@/lib/email'
import { getSiteSettings } from '@/lib/catalogue'

export interface FormState {
  status: 'idle' | 'ok' | 'error'
  message: string
  /**
   * What the visitor typed.
   *
   * React resets an uncontrolled form once its action completes, so without
   * echoing the values back a failed validation wipes the whole enquiry — and
   * the browser's own `required` check then blocks resubmission of the now
   * empty fields. These are fed back in as defaultValue.
   */
  values?: Record<string, string>
}

const newsletterSchema = z.object({ email: z.email('That email does not look right.') })

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '')
  const parsed = newsletterSchema.safeParse({ email })
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0].message, values: { email } }
  }

  const settings = await getSiteSettings()

  // The signup is recorded by notifying the atelier, so no list service is
  // needed on day one. Swap this for a Mailchimp/Resend audience call when
  // the list is big enough to need one.
  const result = await sendEmail({
    to: settings.email,
    subject: `Newsletter signup — ${email}`,
    replyTo: email,
    html: emailLayout('New signup', `<p style="margin:0;font-size:15px">${email}</p>`),
  })

  if (!result.sent && result.reason !== 'not configured') {
    return {
      status: 'error',
      message: 'We could not save that just now. Try again shortly.',
      values: { email },
    }
  }

  return { status: 'ok', message: 'Thank you — you are on the list.' }
}

const contactSchema = z.object({
  name: z.string().min(2, 'Please give us your name.').max(120),
  email: z.email('That email does not look right.'),
  phone: z.string().max(30).optional().or(z.literal('')),
  message: z.string().min(10, 'Tell us a little more.').max(4000),
})

export async function contact(_prev: FormState, formData: FormData): Promise<FormState> {
  const submitted = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    message: String(formData.get('message') ?? ''),
  }

  const parsed = contactSchema.safeParse(submitted)

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0].message, values: submitted }
  }

  const settings = await getSiteSettings()
  const { name, email, phone, message } = parsed.data
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const result = await sendEmail({
    to: settings.email,
    subject: `Enquiry from ${name}`,
    replyTo: email,
    html: emailLayout(
      'New enquiry',
      `<p style="margin:0 0 12px;font-size:15px"><strong>${escape(name)}</strong><br>
       ${escape(email)}${phone ? `<br>${escape(phone)}` : ''}</p>
       <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${escape(message)}</p>`
    ),
  })

  if (!result.sent && result.reason !== 'not configured') {
    return {
      status: 'error',
      message: 'That did not send. Message us on WhatsApp instead?',
      values: submitted,
    }
  }

  return { status: 'ok', message: 'Thank you — we reply within one working day.' }
}
