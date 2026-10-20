import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { toCsv } from '../retreat-core/csv'
import { matchColumns, readAnswers, summarize } from './answers'
import { QUESTIONS, type QuestionId } from './questions'

// Шаблон анкеты курса (public/retreat-materials/guest-form.<lang>.md) предлагает гостю варианты ответа; сводка
// инструмента должна узнавать каждый из них, иначе ответ по шаблону станет «неизвестным вариантом».
const MATERIALS = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials')
// без \b: рядом с кириллицей граница слова в JS не срабатывает
const OTHER = /^(другое|other)(\s|\(|$)/

function optionsOf(lang: 'ru' | 'en', item: string): string[] {
  const line = readFileSync(join(MATERIALS, `guest-form.${lang}.md`), 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${item}. `))
  expect(line, `пункт ${item} в guest-form.${lang}.md`).toBeDefined()
  return line!.slice(line!.indexOf(':') + 1).replace(/\.$/, '').split(' / ').map((s) => s.trim()).filter((s) => !OTHER.test(s))
}

function unknown(lang: 'ru' | 'en', id: QuestionId, answer: string): boolean {
  const q = QUESTIONS.find((x) => x.id === id)!
  const t = readAnswers(toCsv([[q.text[lang]], [answer]], lang))
  const s = summarize(t, matchColumns(t.header, [id]), [id])
  return s.issues.some((i) => i.id === 'unknown-choice')
}

describe('шаблон анкеты курса и сводка инструмента', () => {
  for (const lang of ['ru', 'en'] as const) {
    it(`${lang}: каждый вариант питания из пункта 4 узнаётся`, () => {
      const options = optionsOf(lang, '4')
      expect(options.length).toBeGreaterThanOrEqual(5)
      for (const o of options) expect(unknown(lang, 'diet', o), o).toBe(false)
    })

    it(`${lang}: каждый вариант касания из пункта 9 узнаётся`, () => {
      const options = optionsOf(lang, '9')
      expect(options).toHaveLength(3)
      for (const o of options) expect(unknown(lang, 'touch', o), o).toBe(false)
    })
  }
})
