// Ссылки уроков на год площадки академии: каждая — из venueHref, разбирается обратно в свою площадку, несёт только
// валюту и название в паспорте и ведёт на страницу своей локали. Итоги против движка сверяет тест академии
// (academy/lib/retreat-venue/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { VENUE_EXAMPLES, venueHref, type VenueExampleId } from './venue-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/god-ploshchadki\/#data=[A-Za-z0-9_-]+/g

function decode(href: string): Record<string, unknown> {
  const b64 = href.split('#data=')[1].replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
}

function mdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? mdxFiles(p) : p.endsWith('.mdx') ? [p] : []
  })
}

const ids = VENUE_EXAMPLES.map((e) => e.id) as VenueExampleId[]

describe('учебные ссылки на год площадки', () => {
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свою площадку с названием локали`, () => {
        const ex = VENUE_EXAMPLES.find((e) => e.id === id)!
        expect(decode(venueHref(id, locale))).toEqual({ v: 1, retreat: { currency: ex.currency, title: ex.title[locale] }, tool: ex.venue })
      })
    }
  }
  it('ссылка детерминирована, в паспорте только валюта и название, короче 8 000 знаков', () => {
    for (const id of ids) {
      const href = venueHref(id, 'ru')
      expect(venueHref(id, 'ru')).toBe(href)
      expect(href.length).toBeLessThan(8000)
      expect(Object.keys((decode(href) as { retreat: object }).retreat).sort()).toEqual(['currency', 'title'])
    }
  })
})

describe('ссылки на год площадки в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — venueHref своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => venueHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из venueHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
