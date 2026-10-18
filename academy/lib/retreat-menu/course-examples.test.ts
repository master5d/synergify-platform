import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { computeMenu } from './engine'
import { formFromDecoded, pickMenuTool } from './form'

// Учебные недели курса «Ретрит с двух сторон» (LMS pack retreat) ведут на эту страницу ссылкой #data=.
// Итоги и замечания названы в тексте уроков — тест держит их равными тому, что покажет страница:
// ссылка → разбор страницы → форма → движок. Меняешь движок или форму — тест скажет, какие уроки врут.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'menu-examples.json')
const TODAY = '2026-10-17'

interface Example {
  id: string
  title: { ru: string; en: string }
  data: { v: 1; retreat: Record<string, unknown>; tool: Record<string, unknown> }
  grid: { ru: Record<string, unknown>; en: Record<string, unknown> }
  expect: { perGuestWeek: number; perGroup: number; options: number; issues: Record<string, unknown>[] }
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебные недели меню курса retreat', () => {
  it('файл примеров не пуст и id уникальны', () => {
    expect(examples.length).toBeGreaterThan(0)
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length)
  })
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): страница показывает итоги и замечания из урока`, () => {
        const hash = encodeToolLink({ v: 1, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: { ...ex.data.tool, grid: ex.grid[locale] } })
        const form = formFromDecoded(decodeToolLink(hash, pickMenuTool, locale), TODAY)
        expect(form).not.toBeNull()
        const r = computeMenu(form!.passport, form!.grid, form!.diets)
        expect(r.totals.perGuestWeek).toBe(ex.expect.perGuestWeek)
        expect(r.totals.perGroup).toBe(ex.expect.perGroup)
        expect(r.totals.options).toHaveLength(ex.expect.options)
        expect(r.issues).toEqual(ex.expect.issues)
      })
    }
  }
})
