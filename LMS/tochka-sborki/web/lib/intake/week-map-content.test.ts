import { describe, it, expect } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { buildWeekMapContent } from './week-map-content'
import { TASK_KINDS, WEEK_BUCKETS, WEEK_MAP_MAX_TASKS, WEEK_MAP_MIN_TASKS } from './week-map'
import { CONTENT_ROOT } from '@/lib/pack'

// Реальные модули активного pack'а — по каталогам контента (как у спайна подземелья для чужих pack'ов).
const REAL_SLUGS = readdirSync(join(CONTENT_ROOT, 'ru'), { withFileTypes: true })
  .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
  .map(e => e.name)

describe('buildWeekMapContent', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`has every string for ${locale}`, () => {
      const c = buildWeekMapContent(locale)
      for (const k of ['eyebrow', 'lead', 'inputLabel', 'placeholder', 'addButton', 'removeLabel', 'limitReached',
        'rejectedEmpty', 'rejectedDuplicate', 'unsortedHint', 'tooFew', 'empty', 'routeHeading', 'routeLead'] as const) {
        expect(c[k], k).toBeTruthy()
      }
      for (const b of WEEK_BUCKETS) {
        expect(c.buckets[b].label, b).toBeTruthy()
        expect(c.buckets[b].hint, b).toBeTruthy()
        expect(c.buckets[b].moduleLead, b).toBeTruthy()
      }
    })

    it(`fills the {n}/{min}/{max} placeholders for ${locale}`, () => {
      const c = buildWeekMapContent(locale)
      expect(c.countHint(4)).toContain('4')
      expect(c.countHint(4)).toContain(String(WEEK_MAP_MIN_TASKS))
      expect(c.countHint(4)).toContain(String(WEEK_MAP_MAX_TASKS))
      for (const s of [c.countHint(1), c.limitReached, c.tooFew, c.unsortedInPlan(2)]) expect(s).not.toMatch(/\{\w+\}/)
    })

    it(`frames «keep» as a choice, not a failure (${locale})`, () => {
      const keep = buildWeekMapContent(locale).buckets.keep
      const text = `${keep.label} ${keep.hint} ${keep.moduleLead}`.toLowerCase()
      expect(text).not.toMatch(/провал|не справ|не смог|отстал|fail|can't cope|behind/)
    })
  }

  it('maps every task kind to a real module of the active pack', () => {
    const { moduleByKind } = buildWeekMapContent('ru')
    for (const k of TASK_KINDS) expect(REAL_SLUGS, k).toContain(moduleByKind[k])
  })
})
