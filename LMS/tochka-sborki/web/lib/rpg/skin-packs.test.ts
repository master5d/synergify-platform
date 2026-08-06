// web/lib/rpg/skin-packs.test.ts
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { MODULE_SLUGS, OPTIONAL_MODULE_SLUGS } from './modules'

const dir = join(__dirname, 'skins')
const SKIN_MODULE_SLUGS = [...MODULE_SLUGS, ...OPTIONAL_MODULE_SLUGS]

describe('skin packs', () => {
  const files = readdirSync(dir).filter(f => f.endsWith('.json'))
  it('has at least the wanderer fallback pack', () => {
    expect(files).toContain('wanderer.json')
  })
  for (const f of files) {
    it(`${f} covers all modules with non-empty ru+en`, () => {
      const pack = JSON.parse(readFileSync(join(dir, f), 'utf8'))
      for (const slug of SKIN_MODULE_SLUGS) {
        for (const field of ['zoneNames', 'questTitles'] as const) {
          expect(pack[field]?.[slug]?.ru, `${f} ${field}.${slug}.ru`).toBeTruthy()
          expect(pack[field]?.[slug]?.en, `${f} ${field}.${slug}.en`).toBeTruthy()
        }
      }
    })
  }
})
