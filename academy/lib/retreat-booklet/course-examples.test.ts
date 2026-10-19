import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { checkBooklet } from './checks'
import { formFromDecoded, pickBookletTool } from './form'

// Учебный буклет курса «Ретрит с двух сторон» (урок 03/u5) ведёт на страницу буклета ссылкой #data=. Урок просит найти
// единственную ошибку («не включено» пусто) и прочитать замечания — тест держит их равными тому, что покажет страница:
// ссылка → разбор → форма → проверки на дату импорта.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'booklet-examples.json')

interface Example {
  id: string
  data: Record<'ru' | 'en', { v: 1; retreat: Record<string, unknown>; tool: Record<string, unknown> }>
  expect: Record<'ru' | 'en', { today: string; errors: Record<string, unknown>[]; warnings: Record<string, unknown>[] }>
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебный буклет курса retreat', () => {
  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): ошибки и замечания — как в уроке`, () => {
        const { today, errors, warnings } = ex.expect[locale]
        const hash = encodeToolLink({ v: 1, retreat: ex.data[locale].retreat, tool: ex.data[locale].tool })
        const form = formFromDecoded(decodeToolLink(hash, pickBookletTool, locale), today, locale)
        expect(form).not.toBeNull()
        const result = checkBooklet(form!, locale, today)
        expect(result.errors).toEqual(errors)
        expect(result.warnings).toEqual(warnings)
      })
    }
  }
})
