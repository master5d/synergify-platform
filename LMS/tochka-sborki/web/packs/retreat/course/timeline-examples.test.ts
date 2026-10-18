// Ссылки уроков на таймлайн академии: каждая — из timelineHref, разбирается обратно в свой план, несёт только
// поля паспорта и таймлайна и ведёт на страницу своей локали. Даты против движка сверяет тест академии
// (academy/lib/retreat-timeline/course-examples.test.ts).
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TIMELINE_EXAMPLES, timelineHref, type TimelineExampleId } from './timeline-examples'

const PACK = join(process.cwd(), 'packs', 'retreat')
const LINK = /https:\/\/academy\.synergify\.com(\/en)?\/instrumenty\/tajmlajn\/#data=[A-Za-z0-9_-]+/g
// allowlist ссылки — как в academy/lib/retreat-core/passport.ts и academy/lib/retreat-timeline/form.ts
const RETREAT_KEYS = new Set(['title', 'currency', 'start', 'nights', 'guests', 'arrivalMeal', 'departureMeal'])
const TOOL_KEYS = new Set(['signDate', 'guestDepositPct', 'guestBalanceDueDays', 'guestRefundDays', 'venueNoReturnDays', 'venue'])
const VENUE_KEYS = new Set(['model', 'ratePerGuest', 'buyoutFee', 'capacity', 'minGuests', 'depositPct', 'payInFullDiscountPct', 'finalDueDays', 'installments', 'payInFull'])

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

const ids = TIMELINE_EXAMPLES.map((e) => e.id) as TimelineExampleId[]

describe('учебные ссылки на таймлайн', () => {
  it('id примеров уникальны', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })
  for (const id of ids) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${id} (${locale}): ссылка разбирается обратно в свой план с названием локали`, () => {
        const ex = TIMELINE_EXAMPLES.find((e) => e.id === id)!
        expect(decode(timelineHref(id, locale))).toEqual({ ...ex.data, retreat: { ...ex.data.retreat, title: ex.title[locale] } })
      })
    }
  }
  it('ссылка детерминирована и несёт только поля allowlist', () => {
    for (const id of ids) {
      expect(timelineHref(id, 'ru')).toBe(timelineHref(id, 'ru'))
      const d = decode(timelineHref(id, 'ru')) as { retreat: object; tool: { venue: object } }
      for (const k of Object.keys(d.retreat)) expect(RETREAT_KEYS.has(k), `${id}: retreat.${k}`).toBe(true)
      for (const k of Object.keys(d.tool)) expect(TOOL_KEYS.has(k), `${id}: tool.${k}`).toBe(true)
      for (const k of Object.keys(d.tool.venue)) expect(VENUE_KEYS.has(k), `${id}: venue.${k}`).toBe(true)
    }
  })
  it('EN-ссылка ведёт на /en/, RU — без /en/', () => {
    for (const id of ids) {
      expect(timelineHref(id, 'en')).toContain('academy.synergify.com/en/instrumenty/tajmlajn/')
      expect(timelineHref(id, 'ru')).not.toContain('/en/')
    }
  })
})

describe('ссылки на таймлайн в уроках', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: каждая ссылка — timelineHref учебного плана своей локали, и уроки на них ведут`, () => {
      const known = new Set(ids.map((id) => timelineHref(id, locale)))
      let found = 0
      for (const file of mdxFiles(join(PACK, 'content', locale))) {
        for (const m of readFileSync(file, 'utf8').matchAll(LINK)) {
          expect(known.has(m[0]), `${file}: ссылка не из timelineHref(…, '${locale}')`).toBe(true)
          found++
        }
      }
      expect(found).toBeGreaterThan(0)
    })
  }
})
