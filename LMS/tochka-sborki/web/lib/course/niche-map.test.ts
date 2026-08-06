// web/lib/rpg/niche-map.test.ts
import { describe, it, expect } from 'vitest'
import { NICHE_MODULE } from './niche-map'
import { MODULE_SLUGS } from '@/lib/rpg/modules'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_ROOT, PACK_SLUG } from '@/lib/pack'

// Для Точки Сборки — прежний канон MODULE_SLUGS (1-в-1); для других pack'ов валидные
// слоги — реальные каталоги контента активного pack'а.
const VALID_SLUGS: readonly string[] = PACK_SLUG === 'tochka-sborki'
  ? MODULE_SLUGS
  : readdirSync(join(CONTENT_ROOT, 'ru'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
      .map((e) => e.name)

describe('NICHE_MODULE', () => {
  it('maps every niche to a real module slug', () => {
    for (const slug of Object.values(NICHE_MODULE)) {
      expect(VALID_SLUGS).toContain(slug)
    }
  })
  it('covers the F2 niche values', () => {
    for (const n of ['coach','massage','astrology','content','ecommerce','service','tech','other']) {
      expect(NICHE_MODULE[n]).toBeTruthy()
    }
  })
})
