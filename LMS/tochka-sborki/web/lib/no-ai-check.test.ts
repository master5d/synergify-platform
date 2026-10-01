// Гварды «Проверь себя без ИИ» (BACKLOG «Педагогика 5»): метки <NoAiCheck id/> в MDX активного pack'а ↔
// данные packs/<pack>/course/no-ai-checks.ts в обеих локалях; блок стоит только в фазе practice и только
// в практике, где ученик работает с агентом, после этой работы; 1–2 вопроса; опорные пункты скрыты до
// ответа; пояснение «зачем» — одна фраза со ссылкой на Bastani 2025; тон — манифест и de-hustle.
import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { CONTENT_ROOT, PACK_SLUG } from './pack'
import { MANIFEST } from './manifest'
import { NO_AI_CHECKS } from './course/no-ai-checks'
import { checkManifest } from './authoring/manifest'
import { lintDehustle } from './authoring/dehustle'
import {
  MAX_POINTS, MAX_QUESTIONS, MIN_POINTS, MIN_QUESTIONS, NO_AI_WHY, canShowPoints, findNoAiCheck, noAiTexts,
  type NoAiCheckData,
} from './no-ai-check'
import { NoAiCheck } from '../components/no-ai-check'
import { bindNoAiCheck } from '../components/no-ai-check-bound'

const LOCALES = ['ru', 'en'] as const
const MARK_RE = /<NoAiCheck\s+id="([^"]+)"\s*\/>/g
const FENCE_RE = /```[\s\S]*?```/g
const PHASE_RE = /<Phase type="([a-z]+)">([\s\S]*?)<\/Phase>/g
/** Признак работы с агентом в тексте практики: чат, Claude Code, Role Play. */
const AGENT_RE = /Claude|ChatGPT|агент|agent|<RolePlay/i

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

function mdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? mdxFiles(join(dir, e.name)) : e.name.endsWith('.mdx') ? [join(dir, e.name)] : [])
}

function phases(module: string, unit: string, locale: 'ru' | 'en'): { phase: string; body: string }[] {
  const p = join(CONTENT_ROOT, locale, module, `${unit}.mdx`)
  if (!existsSync(p)) return []
  const src = readFileSync(p, 'utf8')
  return [...src.matchAll(PHASE_RE)].map(ph => ({ phase: ph[1], body: ph[2] }))
}

describe(`no-AI checks registry (${PACK_SLUG})`, () => {
  it('ключи (module/unit/id) уникальны', () => {
    const keys = NO_AI_CHECKS.map(x => `${x.module}/${x.unit}/${x.id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('каждая метка <NoAiCheck id/> в контенте pack\'а имеет данные своего юнита (обе локали)', () => {
    for (const locale of LOCALES) {
      const root = join(CONTENT_ROOT, locale)
      for (const file of mdxFiles(root)) {
        const rel = file.slice(root.length + 1).replace(/\\/g, '/')
        const [module, unitFile] = rel.split('/')
        const unit = unitFile?.replace(/\.mdx$/, '')
        const src = readFileSync(file, 'utf8').replace(FENCE_RE, '')
        for (const m of src.matchAll(MARK_RE)) {
          expect(NO_AI_CHECKS.some(x => x.module === module && x.unit === unit && x.id === m[1]), `${locale}/${rel} → ${m[1]}`).toBe(true)
        }
      }
    }
  })

  for (const x of NO_AI_CHECKS) {
    for (const locale of LOCALES) {
      const at = `${x.module}/${x.unit}#${x.id} [${locale}]`

      it(`${at}: метка стоит только в practice, ровно один раз, после работы с агентом`, () => {
        const all = phases(x.module, x.unit, locale)
        const hits = all.flatMap(ph => [...ph.body.replace(FENCE_RE, '').matchAll(MARK_RE)].filter(m => m[1] === x.id).map(() => ph))
        expect(hits).toHaveLength(1)
        expect(hits[0].phase).toBe('practice')
        const before = hits[0].body.slice(0, hits[0].body.search(new RegExp(`<NoAiCheck\\s+id="${x.id}"`)))
        expect(before, 'до блока в практике должна быть работа с агентом').toMatch(AGENT_RE)
      })

      it(`${at}: ${MIN_QUESTIONS}–${MAX_QUESTIONS} вопроса, у каждого ${MIN_POINTS}–${MAX_POINTS} опорных пункта`, () => {
        expect(x.questions.length).toBeGreaterThanOrEqual(MIN_QUESTIONS)
        expect(x.questions.length).toBeLessThanOrEqual(MAX_QUESTIONS)
        for (const q of x.questions) {
          expect(q.points.length).toBeGreaterThanOrEqual(MIN_POINTS)
          expect(q.points.length).toBeLessThanOrEqual(MAX_POINTS)
        }
        for (const t of noAiTexts(x, locale)) expect(t.trim().length, t).toBeGreaterThan(0)
      })

      it(`${at}: опорные пункты скрыты до ответа`, () => {
        const html = renderToStaticMarkup(createElement(NoAiCheck, { check: x, locale }))
        for (const q of x.questions) {
          expect(html).toContain(esc(q.question[locale]))
          for (const p of q.points) expect(html).not.toContain(esc(p[locale]))
        }
      })

      it(`${at}: тон — манифест и de-hustle`, () => {
        for (const t of noAiTexts(x, locale)) {
          expect(checkManifest(t, MANIFEST), t).toEqual([])
          expect(lintDehustle(t), t).toEqual([])
        }
      })
    }
  }

  it.runIf(PACK_SLUG === 'living-practice')('«Тишина»: блоков нет — волна 23 её не трогает', () => {
    expect(NO_AI_CHECKS).toEqual([])
  })
})

describe('NoAiCheck engine + render', () => {
  const x: NoAiCheckData = {
    module: 'm', unit: 'u', id: 'n',
    questions: [
      { question: { ru: 'Вопрос один?', en: 'Question one?' }, points: [{ ru: 'ПУНКТ А', en: 'POINT A' }, { ru: 'ПУНКТ Б', en: 'POINT B' }] },
      { question: { ru: 'Вопрос два?', en: 'Question two?' }, points: [{ ru: 'ПУНКТ В', en: 'POINT C' }, { ru: 'ПУНКТ Г', en: 'POINT D' }] },
    ],
  }

  it('пояснение «зачем» — одна фраза, ссылается на Bastani 2025, в обеих локалях, тон чистый', () => {
    for (const l of LOCALES) {
      expect(NO_AI_WHY[l]).toMatch(/Bastani/)
      expect(NO_AI_WHY[l]).toMatch(/2025/)
      expect(NO_AI_WHY[l].split(/[.!?](\s|$)/).filter(s => s && s.trim()).length).toBe(1)
      expect(lintDehustle(NO_AI_WHY[l])).toEqual([])
      expect(checkManifest(NO_AI_WHY[l], MANIFEST)).toEqual([])
    }
  })

  it('canShowPoints: пустой и пробельный ответ — нет', () => {
    expect(canShowPoints('')).toBe(false)
    expect(canShowPoints('   ')).toBe(false)
    expect(canShowPoints('мой ответ')).toBe(true)
  })

  it('старт: вопросы, поле, пояснение; кнопка неактивна; пункты скрыты', () => {
    const html = renderToStaticMarkup(createElement(NoAiCheck, { check: x, locale: 'ru' }))
    expect(html).toContain('Проверь себя без ИИ')
    expect(html).toContain('Вопрос два?')
    expect(html).toContain('<textarea')
    expect(html).toContain('Bastani')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Сравнить с опорными пунктами<\/button>/)
    expect(html).not.toContain('ПУНКТ А')
  })

  it('открыто без ответа — пункты всё равно скрыты; с ответом — видны только у своего вопроса', () => {
    const noAnswer = renderToStaticMarkup(createElement(NoAiCheck, { check: x, locale: 'en', initial: { answers: ['', ''], shown: [true, true] } }))
    expect(noAnswer).not.toContain('POINT A')
    const one = renderToStaticMarkup(createElement(NoAiCheck, { check: x, locale: 'en', initial: { answers: ['mine', ''], shown: [true, false] } }))
    expect(one).toContain('POINT A')
    expect(one).toContain('POINT B')
    expect(one).not.toContain('POINT C')
  })

  it('findNoAiCheck и bindNoAiCheck: известный id рендерится, неизвестный — пусто', () => {
    expect(findNoAiCheck([x], 'm', 'u', 'n')).toBe(x)
    const Bound = bindNoAiCheck('m', 'u', 'ru', [x])
    expect(renderToStaticMarkup(createElement(Bound, { id: 'n' }))).toContain('Вопрос один?')
    expect(renderToStaticMarkup(createElement(Bound, { id: 'zzz' }))).toBe('')
  })
})
