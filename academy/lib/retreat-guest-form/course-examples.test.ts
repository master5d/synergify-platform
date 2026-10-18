import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeCsvBytes } from '../retreat-core/csv'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { pickMenuTool } from '../retreat-menu/form'
import { matchColumns, readAnswers, summarize } from './answers'
import { formFromDecoded, menuHashWithDiets, pickFormTool } from './form'

// Учебная анкета курса «Ретрит с двух сторон» (LMS pack retreat): урок ведёт на эту страницу ссылкой #data=,
// а ученик загружает учебные ответы из материалов курса. Тест держит сводку равной тому, что сказано в уроке,
// и диеты — равными диетам учебного меню: один источник цифр для двух уроков.
const WEB = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web')
const COURSE = join(WEB, 'packs', 'retreat', 'course')
const TODAY = '2026-10-17'

interface Example {
  id: string
  title: { ru: string; en: string }
  data: { v: 1; retreat: Record<string, unknown>; tool: Record<string, unknown> }
  sample: { ru: string; en: string }
  menuExample: string
  expect: { rows: number; guests: number; diets: Record<string, number>; issues: string[] }
}

const examples = JSON.parse(readFileSync(join(COURSE, 'form-examples.json'), 'utf8')) as Example[]
const menus = JSON.parse(readFileSync(join(COURSE, 'menu-examples.json'), 'utf8')) as { id: string; data: { tool: { diets: Record<string, number> } } }[]

describe('учебная анкета курса retreat', () => {
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): сводка учебных ответов — как в уроке, диеты — как в учебном меню`, () => {
        const hash = encodeToolLink({ v: 1, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: ex.data.tool })
        const form = formFromDecoded(decodeToolLink(hash, pickFormTool, locale), TODAY)!
        const bytes = readFileSync(join(WEB, 'public', 'retreat-materials', ex.sample[locale]))
        const t = readAnswers(decodeCsvBytes(new Uint8Array(bytes)))
        const s = summarize(t, matchColumns(t.header, form.on), form.on, form.passport.guests)
        expect(t.rows).toHaveLength(ex.expect.rows)
        expect(s.guests).toHaveLength(ex.expect.guests)
        expect(s.diets).toEqual(ex.expect.diets)
        expect([...new Set(s.issues.map((i) => i.id))].sort()).toEqual([...ex.expect.issues].sort())
        // в генератор меню уходят только числа; особые диеты — ровно те, что у учебного меню
        const menu = decodeToolLink(menuHashWithDiets(form.passport, s.diets), pickMenuTool, locale)
        const { standard: _, ...special } = menu.ok && menu.kind === 'tool' ? menu.link.tool.diets : {}
        expect(special).toEqual(menus.find((m) => m.id === ex.menuExample)!.data.tool.diets)
      })
    }
  }
})
