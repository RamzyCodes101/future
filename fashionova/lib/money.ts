/**
 * Money handling.
 *
 * One rule, enforced everywhere: prices live as a plain number of cedis in the
 * CMS, and are only converted to pesewas at the moment we hand an amount to
 * Paystack. No price is ever hardcoded in the codebase.
 */
const formatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatPrice(cedis: number): string {
  return formatter.format(cedis)
}

/** Paystack takes the smallest unit. 1 cedi = 100 pesewas. */
export function toPesewas(cedis: number): number {
  return Math.round(cedis * 100)
}

export function fromPesewas(pesewas: number): number {
  return pesewas / 100
}
