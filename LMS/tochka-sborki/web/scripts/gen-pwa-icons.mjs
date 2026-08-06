// Repeatable PWA icon generation from app/icon.svg (the ⬡ brand glyph).
// Run once after changing the brand icon: `node scripts/gen-pwa-icons.mjs`.
// Emits public/icon-192.png, icon-512.png, icon-maskable-512.png. Outputs are committed.
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'app/icon.svg'))
const pub = join(root, 'public')
const BG = '#0a0a0f'

async function main() {
  // Plain "any" icons: the rounded-rect SVG already fills the frame.
  for (const size of [192, 512]) {
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'contain', background: BG })
      .png()
      .toFile(join(pub, `icon-${size}.png`))
  }

  // Maskable: glyph in the ~80% safe zone on a full-bleed brand background,
  // so platform masks (circle/squircle) never clip the hexagon.
  const inner = Math.round(512 * 0.8)
  const glyph = await sharp(svg, { density: 384 }).resize(inner, inner, { fit: 'contain', background: BG }).png().toBuffer()
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BG } })
    .composite([{ input: glyph, gravity: 'center' }])
    .png()
    .toFile(join(pub, 'icon-maskable-512.png'))

  console.log('PWA icons written to public/: icon-192.png, icon-512.png, icon-maskable-512.png')
}

main().catch(e => { console.error(e); process.exit(1) })
