import { describe, it, expect } from 'vitest'
import { checkContent } from './check'
import { MINI_COURSE } from './__fixtures__/mini-course'
import type { Concept, SiteInput } from './types'

const state = MINI_COURSE.concepts.find((c) => c.id === 'state-md')!
const withConcept = (patch: Partial<Concept>): SiteInput => ({ ...MINI_COURSE, concepts: MINI_COURSE.concepts.map((c) => (c.id === 'state-md' ? { ...c, ...patch } : c)) })
const withUnit = (l: string, m: string, u: string, src: string): SiteInput => ({ ...MINI_COURSE, unitMdx: (ll, mm, uu) => (ll === l && mm === m && uu === u ? src : MINI_COURSE.unitMdx(ll, mm, uu)) })

describe('checkContent', () => {
  it('чистая фикстура — без ошибок', () => expect(checkContent(MINI_COURSE)).toEqual([]))
  it('«Коротко» не найдено в источнике', () => expect(checkContent(withConcept({ short: { ru: 'Этой фразы нет.', en: state.short.en } })).join('\n')).toMatch(/state-md.*Коротко.*ru/))
  it('нет заголовка «Подробно»', () => expect(checkContent(withConcept({ source: { ...state.source, heading: { ru: 'Нет такого', en: state.source.heading.en } } })).join('\n')).toMatch(/state-md.*заголов/))
  it('источника нет', () => expect(checkContent(withConcept({ source: { unit: '01-alpha/u9-none', heading: state.source.heading } })).join('\n')).toMatch(/state-md.*u9-none/))
  it('формы не встречаются в источнике', () => expect(checkContent(withConcept({ forms: { ru: /(?<![A-Za-zА-Яа-яЁё])НИКОГДА(?![A-Za-zА-Яа-яЁё])/, en: state.forms.en } })).join('\n')).toMatch(/state-md.*форм/))
  it('компонент без правила — ключ и строка', () => expect(checkContent(withUnit('ru', '01-alpha', 'u1-start', 'текст\n\n<Foo />')).join('\n')).toMatch(/ru\/u\/01-alpha\/u1-start.*Foo.*строка 3/))
  it('схема словаря проверяется (validateConcepts)', () => expect(checkContent(withConcept({ id: 'State_MD' })).join('\n')).toMatch(/concepts:.*State_MD/))
})
