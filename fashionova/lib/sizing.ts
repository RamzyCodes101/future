/**
 * The size chart.
 *
 * Measurements are the garment's, taken flat and doubled, in centimetres —
 * inches are derived so the two can never drift apart. Ghanaian customers
 * shop across UK, EU and US labelling depending on where they have bought
 * before, so all three are shown rather than picking one.
 */
export interface SizeRow {
  size: string
  uk: string
  eu: string
  us: string
  chest: number
  waist: number
  hip: number
  length: number
}

export const sizeChart: SizeRow[] = [
  { size: 'XS', uk: '6',  eu: '34', us: '2',  chest: 84,  waist: 66, hip: 90,  length: 108 },
  { size: 'S',  uk: '8',  eu: '36', us: '4',  chest: 88,  waist: 70, hip: 94,  length: 110 },
  { size: 'M',  uk: '10', eu: '38', us: '6',  chest: 94,  waist: 76, hip: 100, length: 112 },
  { size: 'L',  uk: '12', eu: '40', us: '8',  chest: 100, waist: 82, hip: 106, length: 114 },
  { size: 'XL', uk: '14', eu: '42', us: '10', chest: 108, waist: 90, hip: 114, length: 116 },
]

export const toInches = (cm: number): string => (cm / 2.54).toFixed(1)
