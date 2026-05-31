/**
 * Generate raster icons and the social-preview image from SVG sources.
 *
 *   npm run assets
 *
 * Outputs land in public/ and ARE committed — they are product assets needed at
 * build time (favicons, PWA icons, OG/Twitter share image). Re-run this whenever
 * the favicon or the source SVGs in scripts/assets/ change.
 */
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const src = join(root, 'scripts', 'assets')

/** Render an SVG file to a PNG of the given pixel width (height preserves aspect). */
function render(svgPath, outPath, width) {
  const svg = readFileSync(svgPath, 'utf8')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica' },
    background: 'rgba(0,0,0,0)',
  })
  writeFileSync(outPath, resvg.render().asPng())
  console.log(`✓ ${outPath.replace(root + '/', '')} (${width}px wide)`)
}

// Transparent icons derived from the existing favicon.
render(join(pub, 'favicon.svg'), join(pub, 'favicon-32.png'), 32)
render(join(pub, 'favicon.svg'), join(pub, 'icon-192.png'), 192)
render(join(pub, 'favicon.svg'), join(pub, 'icon-512.png'), 512)

// Opaque icons (iOS home screen + Android maskable) from the branded variant.
render(join(src, 'icon-bg.svg'), join(pub, 'apple-touch-icon.png'), 180)
render(join(src, 'icon-bg.svg'), join(pub, 'icon-maskable-512.png'), 512)

// 1200x630 social share image for Open Graph / Twitter cards.
render(join(src, 'social-preview.svg'), join(pub, 'social-preview.png'), 1200)

console.log('Done — generated assets are in public/.')
