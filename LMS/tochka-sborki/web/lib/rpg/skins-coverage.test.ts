import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { CONTENT_ROOT, PACK_DIR, PACK_SLUG } from '../pack'
import { fileURLToPath } from 'node:url'
import { MODULE_SLUGS as CORE, OPTIONAL_MODULE_SLUGS } from './modules'

const here = dirname(fileURLToPath(import.meta.url))      // web/lib/rpg
const contentDir = join(CONTENT_ROOT, 'ru') // S3: контент в course-pack
const skinsDir = join(PACK_DIR, 'skins') // S4: skins в course-pack

// core + optional из канона modules.ts — локальный список разъезжался бы молча
const MODULE_SLUGS = [...CORE, ...OPTIONAL_MODULE_SLUGS]

function expectedKeys(): string[] {
  const keys: string[] = []
  for (const m of MODULE_SLUGS) {
    const files = readdirSync(join(contentDir, m)).filter(f => /^u\d.*\.mdx$/.test(f))
    for (const f of files) keys.push(`${m}/${f.replace(/\.mdx$/, '')}`)
  }
  return keys
}

// Канон MODULE_SLUGS — спайн Точки Сборки: у другого pack'а этих каталогов нет,
// и обход контента по канону падал бы на сборе фикстур. Для tochka-sborki — 1-в-1.
describe.runIf(PACK_SLUG === 'tochka-sborki')('skin pack unit-framing coverage', () => {
  const keys = PACK_SLUG === 'tochka-sborki' ? expectedKeys() : []
  const files = readdirSync(skinsDir).filter(f => f.endsWith('.json'))

  it('discovers 44 unit keys', () => {
    expect(keys.length).toBe(44)
  })

  for (const file of files) {
    const pack = JSON.parse(readFileSync(join(skinsDir, file), 'utf8'))
    const units = pack.units ?? {}
    if (Object.keys(units).length === 0) {
      it(`${file}: no units yet (coverage skipped until generated)`, () => {
        expect(Object.keys(units).length).toBe(0)
      })
      continue
    }
    it(`${file}: covers all ${keys.length} unit keys with well-formed framing`, () => {
      for (const k of keys) {
        expect(units[k]?.intro?.ru?.length ?? 0).toBeGreaterThan(0)
        expect(units[k]?.mentorHint?.ru?.length ?? 0).toBeGreaterThan(0)
        expect(units[k]?.outro?.ru?.length ?? 0).toBeGreaterThan(0)
      }
      expect(Object.keys(units).length).toBe(keys.length)
    })
  }
})
