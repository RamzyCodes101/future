/**
 * Generates the brand marks: favicon, apple touch icon and the Open Graph
 * card.
 *
 * Run with `npm run seed:icons`. The output is committed, so a production
 * build never depends on sharp (which is only present here as a transitive
 * dependency of Next).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
mkdirSync(pub, { recursive: true })

const NOIR = '#0b0b0c'
const CHAMPAGNE = '#c6a664'
const IVORY = '#f7f4ee'

/** The monogram: an F in the display serif, champagne on near-black. */
const mark = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${NOIR}"/>
  <text x="50" y="50" fill="${CHAMPAGNE}"
        font-family="Georgia, 'Times New Roman', serif" font-size="64"
        text-anchor="middle" dominant-baseline="central">F</text>
  <rect x="8" y="8" width="84" height="84" fill="none"
        stroke="${CHAMPAGNE}" stroke-opacity="0.35" stroke-width="1"/>
</svg>`

/** The social card, 1200x630, used when a link is shared. */
const ogCard = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${NOIR}"/>
      <stop offset="1" stop-color="#12352e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g stroke="${CHAMPAGNE}" stroke-opacity="0.18" fill="none" stroke-width="1.5">
    ${Array.from({ length: 11 }, (_, i) => `<circle cx="600" cy="760" r="${150 + i * 62}"/>`).join('')}
  </g>
  <text x="80" y="330" fill="${IVORY}"
        font-family="Georgia, 'Times New Roman', serif" font-size="128"
        letter-spacing="-4">FASHIONOVA</text>
  <text x="84" y="392" fill="${CHAMPAGNE}"
        font-family="Helvetica, Arial, sans-serif" font-size="24"
        letter-spacing="8">CONTEMPORARY GHANAIAN TAILORING — ACCRA</text>
</svg>`

const jobs = [
  ['favicon-32.png', mark(32), 32, 32],
  ['icon-192.png', mark(192), 192, 192],
  ['icon-512.png', mark(512), 512, 512],
  ['apple-icon.png', mark(180), 180, 180],
  ['og.png', ogCard, 1200, 630],
]

for (const [name, svg] of jobs) {
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  writeFileSync(join(pub, name), png)
}

// The .ico that browsers request by convention at the site root.
writeFileSync(join(pub, 'favicon.ico'), await sharp(Buffer.from(mark(32))).png().toBuffer())
writeFileSync(join(root, 'app', 'icon.svg'), mark(100).trim())

console.log(`Wrote ${jobs.length + 2} brand marks`)
