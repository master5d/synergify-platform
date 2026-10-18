import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { checkVenue, computeYear } from './engine'
import { pickVenueTool, venueFromDecoded } from './form'

// Учебные площадки курса «Ретрит с двух сторон» (LMS pack retreat): уроки 05/u3 и 05/u4 ведут на эту страницу ссылкой
// #data=. Итоги названы в уроках — тест держит их равными тому, что покажет страница: ссылка → разбор → движок.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'venue-examples.json')

interface Example {
  id: string
  title: { ru: string; en: string }
  currency: string
  venue: Record<string, unknown>
  expect: { noiCents: number; yieldPct: number; paybackYears: number; issues: Record<string, unknown>[] }
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебные площадки курса retreat', () => {
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): итоги и замечания — как в уроке`, () => {
        const hash = encodeToolLink({ v: 1, retreat: { currency: ex.currency, title: ex.title[locale] }, tool: ex.venue })
        const decoded = venueFromDecoded(decodeToolLink(hash, pickVenueTool, locale))!
        expect(decoded.linkHasVenue).toBe(true)
        const r = computeYear(decoded.form.venue)
        expect(r.noiCents).toBe(ex.expect.noiCents)
        expect(Math.round(r.yieldPct! * 10) / 10).toBe(ex.expect.yieldPct)
        expect(Math.round(r.paybackYears! * 10) / 10).toBe(ex.expect.paybackYears)
        expect(checkVenue(decoded.form.venue)).toEqual(ex.expect.issues)
      })
    }
  }
})
