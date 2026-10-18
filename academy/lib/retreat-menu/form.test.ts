import { describe, expect, it } from 'vitest'
import { decodeLink } from '../retreat-calc/link'
import { decodeToolLink, encodeToolLink, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import { timelineHash, defaultForm as timelineDefault } from '../retreat-timeline/form'
import { emptyCell } from './engine'
import {
  calcHashFromPassport, defaultForm, draftOf, formFromDecoded, formFromDraft, menuHash, menuHashFromPassport, pickMenuTool, reconcileGrid, withDraftMenu,
  timelineHashFromPassport, type MenuForm,
} from './form'

const TODAY = '2026-10-17'
const decode = (hash: string) => formFromDecoded(decodeToolLink(hash, pickMenuTool, 'ru'), TODAY)

function filledForm(): MenuForm {
  const f = defaultForm(TODAY)
  f.grid['2-lunch'] = { ...emptyCell(), dish: 'Плов с нутом', allergens: ['celery'], variants: { 'gluten-free': 'Плов без соуса' }, priceCents: 1800, option: { name: 'мясо', priceCents: 800 } }
  f.diets = { vegan: 2, 'gluten-free': 1 }
  return f
}

describe('форма меню', () => {
  it('круг своей ссылки без потерь', () => {
    expect(decode(menuHash(filledForm()))).toEqual(filledForm())
  })
  it('длинные названия обрезаются при записи, неделя со всеми полями по максимуму помещается в ссылку', () => {
    const f = defaultForm(TODAY)
    const long = (ch: string) => ch.repeat(500)
    for (const k of Object.keys(f.grid)) f.grid[k] = {
      ...emptyCell(), dish: long('Я'), side: long('С'), drink: long('Н'), priceCents: 1000,
      variants: { vegan: long('В'), vegetarian: long('Г'), 'gluten-free': long('Б') }, option: { name: long('О'), priceCents: 800 },
    }
    const hash = menuHash(f)
    expect(hash.length).toBeLessThan(TOOL_MAX_FRAGMENT)
    expect(decode(hash)?.grid['2-lunch'].dish).toHaveLength(80)
  })
  it('больше ночей — заполненные ячейки на месте, новые пустые', () => {
    const f = filledForm()
    const g = reconcileGrid(f.grid, { ...f.passport, nights: (f.passport.nights ?? 6) + 1 })
    expect(g['2-lunch'].dish).toBe('Плов с нутом')
    expect(g[`${(f.passport.nights ?? 6) + 2}-breakfast`]).toEqual(emptyCell())
  })
  it('черновик — только паспорт, сетка и диеты, без чужих ключей', () => {
    const f = { ...filledForm(), arrivals: [{ guest: 'Гость 1' }] } as MenuForm
    const draft = draftOf(f)
    expect(draft).not.toMatch(/Гость 1|arrivals/)
    expect(formFromDraft(draft, TODAY)).toEqual(filledForm())
  })
  it('чужие ключи в ссылке отбрасываются', () => {
    const hash = encodeToolLink({ v: 1, retreat: { nights: 6, guests: 16 }, tool: { grid: { '2-lunch': { dish: 'x', phone: '555' }, 'evil': {} }, diets: { vegan: 2, robots: 3 } } })
    const f = decode(hash)!
    expect(Object.keys(f.grid)).not.toContain('evil')
    expect(JSON.stringify(f)).not.toMatch(/phone|555|robots/)
  })
  it('ссылка таймлайна открывает меню с её паспортом и пустой сеткой', () => {
    const tl = timelineDefault(TODAY)
    const f = decode(timelineHash({ ...tl, passport: { ...tl.passport, title: 'Май', nights: 4 } }))!
    expect(f.passport).toMatchObject({ title: 'Май', nights: 4 })
    expect(Object.values(f.grid).every((c) => c.dish === '')).toBe(true)
    expect(Object.keys(f.grid)).toHaveLength(12)
  })
  it('ссылки в соседние инструменты понимаются ими', () => {
    const p = filledForm().passport
    expect(decodeToolLink(timelineHashFromPassport(p), () => ({}), 'ru').ok).toBe(true)
    expect(decodeLink(calcHashFromPassport(p), 'ru').ok).toBe(true)
  })
})

describe('ссылка из таймлайна в меню', () => {
  it('несёт паспорт и открывает пустую сетку', () => {
    const f = decode(menuHashFromPassport({ nights: 2, guests: 8, title: 'Выходные' }))!
    expect(f.passport).toMatchObject({ nights: 2, guests: 8, title: 'Выходные' })
    expect(Object.keys(f.grid)).toHaveLength(6)
  })
})

describe('доделки по приёмке', () => {
  it('ссылка без меню не затирает черновик: паспорт из ссылки, сетка из черновика', () => {
    const draft = filledForm()
    const fromLink = decode(menuHashFromPassport({ ...draft.passport, title: 'Из таймлайна' }))!
    const f = withDraftMenu(fromLink, draft, false)
    expect(f.passport.title).toBe('Из таймлайна')
    expect(f.grid['2-lunch'].dish).toBe('Плов с нутом')
    expect(f.diets).toEqual(draft.diets)
    expect(withDraftMenu(fromLink, draft, true)).toBe(fromLink)
  })
  it('цена опции без названия переживает ссылку; дробные, отрицательные и строковые цены отбрасываются', () => {
    const f = defaultForm(TODAY)
    f.grid['2-lunch'] = { ...emptyCell(), dish: 'Суп', priceCents: 1000, option: { name: '', priceCents: 500 } }
    expect(decode(menuHash(f))?.grid['2-lunch'].option).toEqual({ name: '', priceCents: 500 })
    const bad = pickMenuTool({ grid: { '2-lunch': { dish: 'x', priceCents: 12.5 }, '3-lunch': { dish: 'y', priceCents: -1 }, '4-lunch': { dish: 'z', priceCents: '100' } } })
    expect(Object.values(bad.grid).map((c) => c.priceCents)).toEqual([null, null, null])
  })
  it('мусорные ключи не вытесняют настоящие', () => {
    const junk = Object.fromEntries(Array.from({ length: 500 }, (_, i) => [`junk${i}`, {}]))
    expect(Object.keys(pickMenuTool({ grid: { ...junk, '2-lunch': { dish: 'Суп' } } }).grid)).toEqual(['2-lunch'])
  })
})
