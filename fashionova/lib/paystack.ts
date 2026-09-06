import 'server-only'

export const PAYSTACK_BASE = 'https://api.paystack.co'

/**
 * The channels a Ghanaian customer actually pays with. Mobile money is listed
 * first deliberately — for most customers here it is the primary method, not
 * an alternative to a card.
 */
export const PAYSTACK_CHANNELS = ['mobile_money', 'card', 'bank_transfer'] as const

export const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY)

export async function paystack<T>(
  path: string,
  init?: RequestInit
): Promise<{ status: boolean; message: string; data: T }> {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set')

  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })

  return (await response.json()) as { status: boolean; message: string; data: T }
}

/** A human-readable reference the customer can quote over WhatsApp. */
export function orderReference(): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FN-${stamp}-${salt}`
}
