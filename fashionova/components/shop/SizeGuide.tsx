'use client'

import { useState } from 'react'
import { sizeChart, toInches } from '@/lib/sizing'

/**
 * A disclosure rather than a modal — a modal here would have to trap focus,
 * fight the smooth scroll, and close on escape, for content that is just a
 * table. Expanding in place is less machinery and easier to read on a phone.
 */
export function SizeGuide() {
  const [open, setOpen] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="size-guide"
        className="label link-underline text-taupe"
      >
        {open ? 'Hide size guide' : 'Size guide'}
      </button>

      <div id="size-guide" hidden={!open} className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-xs text-taupe">Garment measurements, taken flat and doubled.</p>
          <div className="flex shrink-0 border rule">
            {(['cm', 'in'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`label px-3 py-1.5 transition-colors ${
                  unit === u ? 'bg-ink text-ivory' : 'text-taupe'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Wide tables scroll inside their own container rather than pushing
            the page sideways. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">
              Size chart in {unit === 'cm' ? 'centimetres' : 'inches'}
            </caption>
            <thead>
              <tr className="border-b rule text-left">
                {['Size', 'UK', 'EU', 'US', 'Chest', 'Waist', 'Hip', 'Length'].map((h) => (
                  <th key={h} scope="col" className="label py-3 pr-4 font-medium text-taupe">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size} className="border-b rule last:border-0">
                  <th scope="row" className="label py-3 pr-4 text-left font-medium">
                    {row.size}
                  </th>
                  <td className="py-3 pr-4 tabular-nums text-graphite">{row.uk}</td>
                  <td className="py-3 pr-4 tabular-nums text-graphite">{row.eu}</td>
                  <td className="py-3 pr-4 tabular-nums text-graphite">{row.us}</td>
                  {([row.chest, row.waist, row.hip, row.length] as const).map((v, i) => (
                    <td key={i} className="py-3 pr-4 tabular-nums text-graphite">
                      {unit === 'cm' ? v : toInches(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-taupe">
          Between two sizes, take the larger — our cuts are meant to skim, not cling. Made-to-order
          pieces are cut to your own measurements at no extra cost; send them over WhatsApp.
        </p>
      </div>
    </div>
  )
}
