// Гварды faded worked examples (BACKLOG «Педагогика 4»): метки <FadedExample id/> в MDX активного pack'а ↔
// примеры packs/<pack>/course/faded-examples.ts в обеих локалях; метка стоит в фазе practice; три ступени
// заполнены; на ступени с пропусками есть и пропуски, и данные шаги; эталон пропуска не рендерится до
// сравнения; тексты держат манифест и de-hustle.
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CONTENT_ROOT, PACK_SLUG } from './pack'
import { MANIFEST } from './manifest'
import { FADED_EXAMPLES } from './course/faded-examples'
import { checkManifest } from './authoring/manifest'
import { lintDehustle } from './authoring/dehustle'
import {
  MIN_WORKED_STEPS, blankIndexes, canReveal, fadedTexts, findFadedExample, type FadedExampleData,
} from './faded-example'
import { FadedExample } from '../components/faded-example'
import { bindFadedExample } from '../components/faded-example-bound'

const LOCALES = ['ru', 'en'] as const
const MARK_RE = /<FadedExample\s+id="([^"]+)"\s*\/>/g
const FENCE_RE = /```[\s\S]*?```/g
const PHASE_RE = /<Phase type="([a-z]+)">([\s\S]*?)<\/Phase>/g

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

function mdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? mdxFiles(join(dir, e.name)) : e.name.endsWith('.mdx') ? [join(dir, e.name)] : [])
}

/** Метки по фазам юнита: { phase, id }[]. */
function marksByPhase(module: string, unit: string, locale: 'ru' | 'en'): { phase: string; id: string }[] {
  const p = join(CONTENT_ROOT, locale, module, `${unit}.mdx`)
  if (!existsSync(p)) return []
  const src = readFileSync(p, 'utf8').replace(FENCE_RE, '')
  return [...src.matchAll(PHASE_RE)].flatMap(ph => [...ph[2].matchAll(MARK_RE)].map(m => ({ phase: ph[1], id: m[1] })))
}

function render(x: FadedExampleData, locale: 'ru' | 'en', initial?: Parameters<typeof FadedExample>[0]['initial']): string {
  return renderToStaticMarkup(createElement(FadedExample, { example: x, locale, initial }))
}

describe(`faded examples registry (${PACK_SLUG})`, () => {
  it('ключи (module/unit/id) уникальны', () => {
    const keys = FADED_EXAMPLES.map(x => `${x.module}/${x.unit}/${x.id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('каждая метка <FadedExample id/> в контенте pack\'а имеет пример своего юнита (обе локали)', () => {
    for (const locale of LOCALES) {
      const root = join(CONTENT_ROOT, locale)
      for (const file of mdxFiles(root)) {
        const rel = file.slice(root.length + 1).replace(/\\/g, '/')
        const [module, unitFile] = rel.split('/')
        const unit = unitFile?.replace(/\.mdx$/, '')
        const src = readFileSync(file, 'utf8').replace(FENCE_RE, '')
        for (const m of src.matchAll(MARK_RE)) {
          expect(FADED_EXAMPLES.some(x => x.module === module && x.unit === unit && x.id === m[1]), `${locale}/${rel} → ${m[1]}`).toBe(true)
        }
      }
    }
  })

  for (const x of FADED_EXAMPLES) {
    for (const locale of LOCALES) {
      const at = `${x.module}/${x.unit}#${x.id} [${locale}]`

      it(`${at}: метка стоит только в фазе practice, ровно один раз`, () => {
        const marks = marksByPhase(x.module, x.unit, locale).filter(m => m.id === x.id)
        expect(marks).toHaveLength(1)
        expect(marks[0].phase).toBe('practice')
      })

      it(`${at}: три ступени заполнены`, () => {
        expect(x.worked.steps.length).toBeGreaterThanOrEqual(MIN_WORKED_STEPS)
        for (const t of fadedTexts(x, locale)) expect(t.trim().length, t).toBeGreaterThan(0)
        expect(x.faded.task[locale]).not.toBe(x.worked.task[locale])
      })

      it(`${at}: на ступени с пропусками есть и пропуски, и данные шаги (снятие опор, а не пустой лист)`, () => {
        const blanks = blankIndexes(x)
        expect(blanks.length).toBeGreaterThan(0)
        expect(blanks.length).toBeLessThan(x.faded.steps.length)
        expect(x.worked.steps.some(s => 'blank' in s && (s as { blank?: boolean }).blank), 'полный разбор без пропусков').toBe(false)
      })

      it(`${at}: эталон пропусков скрыт до сравнения`, () => {
        const blanks = blankIndexes(x).map(i => x.faded.steps[i])
        const hidden = (html: string) => blanks.every(s => !html.includes(esc(s.text[locale])) && !html.includes(esc(s.why[locale])))
        expect(hidden(render(x, locale, { stage: 'worked' })), 'полный разбор').toBe(true)
        expect(hidden(render(x, locale, { stage: 'faded' })), 'пустые пропуски').toBe(true)
        const filled = x.faded.steps.map(() => 'мой ответ')
        expect(hidden(render(x, locale, { stage: 'faded', answers: filled })), 'заполнено, но не сравнено').toBe(true)
        const partial = x.faded.steps.map((_, i) => (i === blankIndexes(x)[0] ? '' : 'мой ответ'))
        expect(hidden(render(x, locale, { stage: 'faded', answers: partial, revealed: true })), 'не все пропуски заполнены').toBe(true)
        const open = render(x, locale, { stage: 'faded', answers: filled, revealed: true })
        for (const s of blanks) expect(open).toContain(esc(s.text[locale]))
      })

      it(`${at}: тон — манифест и de-hustle`, () => {
        for (const t of fadedTexts(x, locale)) {
          expect(checkManifest(t, MANIFEST), t).toEqual([])
          expect(lintDehustle(t), t).toEqual([])
        }
      })
    }
  }

  // Прогон COURSE_PACK=living-practice: «Тишину» волна 23 не трогает.
  it.runIf(PACK_SLUG === 'living-practice')('«Тишина»: примеров нет — волна 23 её не трогает', () => {
    expect(FADED_EXAMPLES).toEqual([])
  })
})

describe('FadedExample engine + render', () => {
  const x: FadedExampleData = {
    module: 'm', unit: 'u', id: 'f',
    title: { ru: 'Тип задачи', en: 'Task type' },
    worked: {
      task: { ru: 'Разбор.', en: 'Walkthrough.' },
      steps: [1, 2, 3].map(n => ({ label: { ru: `Шаг ${n}`, en: `Step ${n}` }, text: { ru: `Ответ ${n}`, en: `Answer ${n}` }, why: { ru: `Почему ${n}`, en: `Why ${n}` } })),
    },
    faded: {
      task: { ru: 'С пропусками.', en: 'With gaps.' },
      steps: [
        { label: { ru: 'Дано', en: 'Given' }, text: { ru: 'Данный ответ', en: 'Given answer' }, why: { ru: 'Данное почему', en: 'Given why' } },
        { label: { ru: 'Пропуск', en: 'Gap' }, text: { ru: 'СКРЫТЫЙ ЭТАЛОН', en: 'HIDDEN REFERENCE' }, why: { ru: 'СКРЫТОЕ ПОЧЕМУ', en: 'HIDDEN WHY' }, blank: true },
      ],
    },
    solo: { task: { ru: 'Сам: своя задача.', en: 'Solo: your own task.' } },
  }

  it('canReveal: только когда заполнен каждый пропуск; без пропусков — никогда', () => {
    expect(canReveal(['', ''], [1])).toBe(false)
    expect(canReveal(['', '   '], [1])).toBe(false)
    expect(canReveal(['', 'ответ'], [1])).toBe(true)
    expect(canReveal(['a', 'b'], [])).toBe(false)
  })

  it('старт — полный разбор со всеми «почему» и кнопкой «Сразу к самостоятельной»', () => {
    const html = render(x, 'ru')
    expect(html).toContain('Разбор примера · Тип задачи')
    expect(html).toContain('Почему 3')
    expect(html).toContain('Сразу к самостоятельной')
    expect(html).not.toContain('СКРЫТЫЙ ЭТАЛОН')
  })

  it('ступень с пропусками: поле ввода, кнопка сравнения неактивна до ответа, эталон скрыт', () => {
    const html = render(x, 'en', { stage: 'faded' })
    expect(html).toContain('<textarea')
    expect(html).toContain('Given answer')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Compare with the reference<\/button>/)
    expect(html).not.toContain('HIDDEN REFERENCE')
    expect(html).not.toContain('HIDDEN WHY')
    expect(html).toContain('Skip to the solo step')
  })

  it('после сравнения — эталон и «почему» у пропуска, дальше — «сам»', () => {
    const html = render(x, 'ru', { stage: 'faded', answers: ['', 'мой ответ'], revealed: true })
    expect(html).toContain('СКРЫТЫЙ ЭТАЛОН')
    expect(html).toContain('СКРЫТОЕ ПОЧЕМУ')
    expect(html).toContain('Дальше: сам')
  })

  it('самостоятельная ступень — только постановка', () => {
    const html = render(x, 'ru', { stage: 'solo' })
    expect(html).toContain('Сам: своя задача.')
    expect(html).not.toContain('Ответ 1')
    expect(html).not.toContain('<textarea')
  })

  it('findFadedExample и bindFadedExample: известный id рендерится, неизвестный — пусто', () => {
    expect(findFadedExample([x], 'm', 'u', 'f')).toBe(x)
    expect(findFadedExample([x], 'm', 'other', 'f')).toBeNull()
    const Bound = bindFadedExample('m', 'u', 'ru', [x])
    expect(renderToStaticMarkup(createElement(Bound, { id: 'f' }))).toContain('Тип задачи')
    expect(renderToStaticMarkup(createElement(Bound, { id: 'zzz' }))).toBe('')
  })
})
