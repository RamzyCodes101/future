/**
 * Generates the placeholder imagery the site ships with.
 *
 * These are NOT meant to survive to launch — they exist so the layout, the
 * scroll choreography and the colour relationships can be judged before the
 * Accra shoot happens. Each one is a flat SVG in the brand palette carrying a
 * wax-print-derived motif, so the grid reads as considered rather than broken.
 *
 * Replace them by uploading real photography in the Studio; nothing in the
 * app references these files by name once products come from Sanity.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'img')
mkdirSync(outDir, { recursive: true })

const PALETTE = {
  noir: '#0b0b0c',
  ink: '#16161a',
  taupe: '#9a8b79',
  mist: '#dcd4c7',
  bone: '#efeae1',
  ivory: '#f7f4ee',
  champagne: '#c6a664',
  jade: '#12352e',
  oxblood: '#4a1c1b',
}

/** Concentric arcs — after the peacock-fan wax print in the reference set. */
const fan = (fg, opacity) => `
  <g stroke="${fg}" stroke-opacity="${opacity}" fill="none" stroke-width="1.5">
    ${Array.from({ length: 14 }, (_, i) => `<circle cx="50%" cy="118%" r="${90 + i * 46}" />`).join('')}
  </g>`

/** Diamond lattice — after the brocade/damask two-piece. */
const lattice = (fg, opacity) => `
  <g stroke="${fg}" stroke-opacity="${opacity}" fill="none" stroke-width="1.25">
    ${Array.from({ length: 22 }, (_, i) =>
      `<path d="M ${i * 90 - 400} 1400 L ${i * 90 + 300} 0" />` +
      `<path d="M ${i * 90 - 400} 0 L ${i * 90 + 300} 1400" />`
    ).join('')}
  </g>`

/** Diagonal wave bands — after the red-and-white co-ord. */
const bands = (fg, opacity) => `
  <g fill="${fg}" fill-opacity="${opacity}">
    ${Array.from({ length: 16 }, (_, i) =>
      `<path d="M ${-200 + i * 120} 1500 q 120 -375 0 -750 q -120 -375 0 -750 l 46 0 q 120 375 0 750 q -120 375 0 750 z" />`
    ).join('')}
  </g>`

/** Single line-drawn face — after the appliqué kaftan. */
const line = (fg, opacity, w, h) => {
  // Percentages are not valid inside path data, so every coordinate is
  // resolved against the canvas here.
  const x = (f) => (w * f).toFixed(0)
  const y = (f) => (h * f).toFixed(0)
  return `
  <g stroke="${fg}" stroke-opacity="${opacity}" fill="none"
     stroke-width="${(w * 0.006).toFixed(1)}" stroke-linecap="round">
    <path d="M ${x(0.46)} ${y(0.26)}
             C ${x(0.32)} ${y(0.3)} ${x(0.29)} ${y(0.46)} ${x(0.34)} ${y(0.56)}
             C ${x(0.39)} ${y(0.66)} ${x(0.52)} ${y(0.68)} ${x(0.58)} ${y(0.6)}
             C ${x(0.66)} ${y(0.5)} ${x(0.62)} ${y(0.32)} ${x(0.5)} ${y(0.3)}" />
    <path d="M ${x(0.36)} ${y(0.42)} q ${x(0.05)} ${y(-0.03)} ${x(0.1)} 0" />
    <path d="M ${x(0.38)} ${y(0.43)} l 0 ${y(0.012)}" />
    <ellipse cx="${x(0.63)}" cy="${y(0.52)}" rx="${x(0.035)}" ry="${y(0.045)}" />
    <path d="M ${x(0.4)} ${y(0.58)} q ${x(0.06)} ${y(0.035)} ${x(0.12)} ${y(-0.008)}" />
    <path d="M ${x(0.55)} ${y(0.2)}
             C ${x(0.68)} ${y(0.24)} ${x(0.72)} ${y(0.4)} ${x(0.66)} ${y(0.5)}" />
  </g>`
}

const MOTIFS = { fan, lattice, bands, line }

function svg({ w, h, ground, motif, accent, tone }) {
  // Light grounds swallow a faint line, so the motif is pushed harder there.
  const light = ['#efeae1', '#f7f4ee', '#dcd4c7', '#9a8b79'].includes(ground)
  const draw = MOTIFS[motif](accent, light ? 0.42 : 0.24, w, h)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${ground}"/>
      <stop offset="1" stop-color="${tone}"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3"/>
      <feColorMatrix type="saturate" values="0"/></filter>
    <clipPath id="c"><rect width="${w}" height="${h}"/></clipPath>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g clip-path="url(#c)">${draw}</g>
  <rect width="${w}" height="${h}" filter="url(#n)" opacity="0.06"/>
</svg>`
}

const P = 3 / 4 // portrait ratio used by every product card
const portrait = { w: 1200, h: 1200 / P }
const wide = { w: 2000, h: 1125 }

const files = [
  // Product imagery — one pair per catalogue entry.
  ['product-adinkra-1', portrait, PALETTE.jade, 'fan', PALETTE.champagne, PALETTE.noir],
  ['product-adinkra-2', portrait, PALETTE.noir, 'fan', PALETTE.mist, PALETTE.jade],
  ['product-akoma-1', portrait, PALETTE.oxblood, 'bands', PALETTE.bone, PALETTE.noir],
  ['product-akoma-2', portrait, PALETTE.ink, 'bands', PALETTE.champagne, PALETTE.oxblood],
  ['product-sankofa-1', portrait, PALETTE.bone, 'line', PALETTE.oxblood, PALETTE.mist],
  ['product-sankofa-2', portrait, PALETTE.mist, 'line', PALETTE.ink, PALETTE.taupe],
  ['product-kente-1', portrait, PALETTE.noir, 'lattice', PALETTE.champagne, PALETTE.ink],
  ['product-kente-2', portrait, PALETTE.jade, 'lattice', PALETTE.champagne, PALETTE.noir],
  ['product-adire-1', portrait, PALETTE.ink, 'fan', PALETTE.taupe, PALETTE.jade],
  ['product-adire-2', portrait, PALETTE.jade, 'bands', PALETTE.mist, PALETTE.ink],
  ['product-boubou-1', portrait, PALETTE.oxblood, 'lattice', PALETTE.champagne, PALETTE.ink],
  ['product-boubou-2', portrait, PALETTE.noir, 'lattice', PALETTE.taupe, PALETTE.oxblood],
  ['product-agbada-1', portrait, PALETTE.bone, 'fan', PALETTE.jade, PALETTE.mist],
  ['product-agbada-2', portrait, PALETTE.ivory, 'line', PALETTE.champagne, PALETTE.bone],
  ['product-kaftan-1', portrait, PALETTE.mist, 'line', PALETTE.oxblood, PALETTE.bone],
  ['product-kaftan-2', portrait, PALETTE.taupe, 'fan', PALETTE.noir, PALETTE.mist],
  ['product-gele-1', portrait, PALETTE.jade, 'bands', PALETTE.champagne, PALETTE.noir],
  ['product-gele-2', portrait, PALETTE.oxblood, 'fan', PALETTE.mist, PALETTE.noir],
  ['product-wrapper-1', portrait, PALETTE.ink, 'lattice', PALETTE.mist, PALETTE.noir],
  ['product-wrapper-2', portrait, PALETTE.noir, 'bands', PALETTE.champagne, PALETTE.jade],
  ['product-tunic-1', portrait, PALETTE.bone, 'lattice', PALETTE.taupe, PALETTE.mist],
  ['product-tunic-2', portrait, PALETTE.mist, 'bands', PALETTE.oxblood, PALETTE.bone],
  ['product-shirt-1', portrait, PALETTE.jade, 'line', PALETTE.bone, PALETTE.ink],
  ['product-shirt-2', portrait, PALETTE.ink, 'fan', PALETTE.champagne, PALETTE.noir],
  // Editorial / hero.
  ['hero', wide, PALETTE.noir, 'fan', PALETTE.champagne, PALETTE.jade],
  ['editorial-atelier', wide, PALETTE.ink, 'lattice', PALETTE.taupe, PALETTE.noir],
  ['editorial-fabric', wide, PALETTE.jade, 'bands', PALETTE.champagne, PALETTE.noir],
  ['editorial-accra', wide, PALETTE.oxblood, 'fan', PALETTE.bone, PALETTE.noir],
  ['look-1', portrait, PALETTE.noir, 'bands', PALETTE.champagne, PALETTE.oxblood],
  ['look-2', portrait, PALETTE.bone, 'fan', PALETTE.jade, PALETTE.mist],
  ['look-3', portrait, PALETTE.jade, 'lattice', PALETTE.mist, PALETTE.noir],
  ['look-4', portrait, PALETTE.oxblood, 'line', PALETTE.bone, PALETTE.ink],
  ['look-5', portrait, PALETTE.ink, 'fan', PALETTE.taupe, PALETTE.noir],
  ['look-6', portrait, PALETTE.mist, 'bands', PALETTE.oxblood, PALETTE.taupe],
  ['journal-1', wide, PALETTE.jade, 'fan', PALETTE.champagne, PALETTE.ink],
  ['journal-2', wide, PALETTE.noir, 'bands', PALETTE.mist, PALETTE.jade],
  ['journal-3', wide, PALETTE.oxblood, 'lattice', PALETTE.champagne, PALETTE.ink],
]

for (const [name, size, ground, motif, accent, tone] of files) {
  writeFileSync(
    join(outDir, `${name}.svg`),
    svg({ ...size, ground, motif, accent, tone })
  )
}

console.log(`Wrote ${files.length} placeholder images to public/img/`)
