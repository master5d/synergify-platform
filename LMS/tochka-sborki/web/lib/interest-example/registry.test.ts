// Гвард разметки примеров под сферу ученика (intake LMS#8): метки <InterestExample id/> в MDX
// активного pack'а ↔ записи packs/<pack>/course/interest-examples.ts, в обеих локалях.
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'
import { MANIFEST } from '../manifest'
import { INTEREST_EXAMPLES } from '../course/interest-examples'
import { QUESTIONS_V2 } from '../course/intake-questions'
import { checkInterestExample } from './guard'
import { INTERESTS } from './interests'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { InterestExample } from '../../components/interest-example'
import { bindInterestExample } from '../../components/interest-example-bound'

const MARK_RE = /<InterestExample\s+id="([^"]+)"\s*\/>/g
const FENCE_RE = /```[\s\S]*?```/g

function marks(module: string, unit: string, locale: 'ru' | 'en'): string[] {
  const p = join(CONTENT_ROOT, locale, module, `${unit}.mdx`)
  if (!existsSync(p)) return []
  const src = readFileSync(p, 'utf8').replace(FENCE_RE, '')
  const concept = /<Phase type="concept">([\s\S]*?)<\/Phase>/.exec(src)?.[1] ?? src
  return [...concept.matchAll(MARK_RE)].map(m => m[1])
}

describe(`interest examples registry (${PACK_SLUG})`, () => {
  it('ключи (module/unit/id) уникальны', () => {
    const keys = INTEREST_EXAMPLES.map(x => `${x.module}/${x.unit}/${x.id}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  for (const item of INTEREST_EXAMPLES) {
    for (const locale of ['ru', 'en'] as const) {
      const at = `${item.module}/${item.unit}#${item.id} [${locale}]`
      it(`${at}: метка стоит в концепт-фазе ровно один раз`, () => {
        expect(marks(item.module, item.unit, locale).filter(id => id === item.id)).toHaveLength(1)
      })
      it(`${at}: исходник пригоден к пересказу`, () => {
        const text = item.text[locale]
        expect(text.trim().length).toBeGreaterThan(40)
        expect(text.length).toBeLessThanOrEqual(1200)
        expect(text).not.toMatch(/```|https?:\/\/|^\s*\|/m)
        expect(checkInterestExample(text, text, MANIFEST)).toEqual([])
      })
    }
  }

  it('каждая метка в MDX имеет запись (иначе на уроке — пустое место)', () => {
    for (const item of INTEREST_EXAMPLES) {
      for (const locale of ['ru', 'en'] as const) {
        for (const id of marks(item.module, item.unit, locale)) {
          expect(INTEREST_EXAMPLES.some(x => x.module === item.module && x.unit === item.unit && x.id === id), `${item.module}/${item.unit} ${id}`).toBe(true)
        }
      }
    }
  })

  it('закрытый список интересов ⊆ опций V_NICHE анкеты', () => {
    const niche = QUESTIONS_V2.find(q => q.id === 'V_NICHE')!
    const values = niche.options!.map(o => o.value)
    for (const i of INTERESTS) expect(values).toContain(i)
  })
})

describe('InterestExample render', () => {
  const item = { module: 'm', unit: 'u', id: 'e', text: { ru: 'Общий `код` пример.\n\nВторой абзац.', en: 'General `code` example.\n\nSecond paragraph.' } }
  it('без ответа воркера — общий пример с меткой «Пример», без кнопки', () => {
    const html = renderToStaticMarkup(createElement(InterestExample, { item, locale: 'ru' }))
    expect(html).toContain('Пример')
    expect(html).toContain('<code')
    expect(html).toContain('Второй абзац.')
    expect(html).not.toContain('Показать общий пример')
  })
  it('с персональным — метка сферы и кнопка «Показать общий пример»', () => {
    const html = renderToStaticMarkup(createElement(InterestExample, { item, locale: 'ru', initial: { interest: 'coach', text: 'Коуч `код` пример.\n\nАбзац.' } }))
    expect(html).toContain('Пример под твою сферу: коучинг и психология')
    expect(html).toContain('Показать общий пример')
    expect(html).toContain('Коуч ')
    const en = renderToStaticMarkup(createElement(InterestExample, { item, locale: 'en', initial: { interest: 'tech', text: 'x `code` y.\n\nz.' } }))
    expect(en).toContain('Example for your field: tech and development')
    expect(en).toContain('Show the general example')
  })
  it('bindInterestExample: известный id рендерится, неизвестный — пусто', () => {
    const Bound = bindInterestExample('m', 'u', 'en', [item])
    expect(renderToStaticMarkup(createElement(Bound, { id: 'e' }))).toContain('General ')
    expect(renderToStaticMarkup(createElement(Bound, { id: 'zzz' }))).toBe('')
  })
})
