import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { formFromDecoded } from './form'
import { checkGrid, pickProgramTool } from './grid'
import { starterCards } from './practices'

// Учебная неделя курса «Ретрит с двух сторон» (LMS pack retreat) ведёт на эту страницу ссылкой #data= без карточек:
// практики берутся из реестра, у нового ученика это стартовый набор. Проблемы сетки названы в уроках 04/u1 и 04/u2 —
// тест держит их равными тому, что покажет страница: ссылка → разбор → форма → проверки со стартовым набором.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'program-examples.json')
const TODAY = '2026-10-18'

interface Example {
  id: string
  title: { ru: string; en: string }
  data: { v: 1; retreat: Record<string, unknown>; tool: Record<string, unknown> }
  expect: { issues: Record<string, unknown>[] }
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебная неделя программы курса retreat', () => {
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): проблемы сетки со стартовым набором — как в уроке`, () => {
        const hash = encodeToolLink({ v: 1, retreat: { ...ex.data.retreat, title: ex.title[locale] }, tool: ex.data.tool })
        const decoded = formFromDecoded(decodeToolLink(hash, pickProgramTool, locale), TODAY)!
        const cards = starterCards(locale)
        expect(decoded.form.blocks.filter((b) => b.kind === 'practice').every((b) => cards.some((c) => c.id === b.practiceId))).toBe(true)
        expect(checkGrid(decoded.form.passport, decoded.form.blocks, cards)).toEqual(ex.expect.issues)
      })
    }
  }
})
