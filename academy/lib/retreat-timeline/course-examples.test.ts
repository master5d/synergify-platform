import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { buildTimeline } from './engine'
import { formFromDecoded, pickTimelineTool, type TimelineLinkTool } from './form'

// Учебные планы курса «Ретрит с двух сторон» (LMS pack retreat) ведут на эту страницу ссылкой #data=.
// Даты и предупреждения названы в тексте уроков — тест держит их равными тому, что покажет страница:
// ссылка → разбор страницы → форма → движок. Меняешь движок или форму — тест скажет, какие уроки врут.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'timeline-examples.json')
// «сегодня» до подписания учебных планов: ни одна веха ещё не прошла
const TODAY = '2026-10-17'

interface Example {
  id: string
  title: { ru: string; en: string }
  data: { v: 1; retreat: Record<string, unknown>; tool: TimelineLinkTool }
  expect: Record<string, string | string[]>
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебные планы курса retreat', () => {
  it('файл примеров не пуст и id уникальны', () => {
    expect(examples.length).toBeGreaterThan(0)
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length)
  })
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): страница показывает даты и предупреждения из урока`, () => {
        const hash = encodeToolLink({ v: 1, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: ex.data.tool })
        const form = formFromDecoded(decodeToolLink(hash, pickTimelineTool, locale), TODAY)
        expect(form).not.toBeNull()
        const r = buildTimeline(form!.passport, form!.terms, TODAY)
        const { warnings, ...dates } = ex.expect
        for (const [id, date] of Object.entries(dates)) {
          expect(r.milestones.find((m) => m.id === id)?.date, `${ex.id}: ${id}`).toBe(date)
        }
        expect(r.warnings.map((w) => w.id)).toEqual(warnings)
      })
    }
  }
})
