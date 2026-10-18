import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cellKey, emptyCell, menuSlots, type MenuGrid, type MenuIssueId } from './engine'
import { menuFromCsv, menuMoney, menuToCsv, parseMoney } from './export'
import { issueText } from './labels'

const SLOTS = menuSlots({ nights: 6 })
const template = (name: string) =>
  readFileSync(join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials', name), 'utf8')

function sampleGrid(): MenuGrid {
  const g: MenuGrid = {}
  for (const s of SLOTS) g[cellKey(s)] = { ...emptyCell(), dish: `Блюдо ${s.day}`, priceCents: 1250 }
  g['2-lunch'] = {
    dish: 'Плов с курицей; по-домашнему', side: 'Салат, зелень', drink: 'Узвар', meat: true,
    variants: { vegetarian: 'Плов с нутом', vegan: 'Плов с нутом', 'gluten-free': 'Плов с нутом' },
    allergens: ['celery', 'gluten'], priceCents: 1800, option: { name: 'двойная порция', priceCents: 450 },
  }
  return g
}

describe('CSV меню для шефа', () => {
  it('BOM и заголовок — как у шаблона курса, на обоих языках', () => {
    for (const lang of ['ru', 'en'] as const) {
      const csv = menuToCsv(SLOTS, sampleGrid(), lang)
      expect(csv.startsWith('\uFEFF')).toBe(true)
      expect(csv.split('\r\n')[0]).toBe(template(`menu-week.${lang}.csv`).split(/\r?\n/)[0])
    }
  })
  it('круг CSV без потерь на обоих языках: мясное, варианты, аллергены, опция, дробная цена', () => {
    for (const lang of ['ru', 'en'] as const) expect(menuFromCsv(menuToCsv(SLOTS, sampleGrid(), lang))).toEqual(sampleGrid())
  })
  it('знак « | » внутри варианта не режет его', () => {
    const g = sampleGrid()
    g['2-lunch'] = { ...g['2-lunch'], variants: { vegan: 'Плов с нутом | без масла', 'gluten-free': 'Рис' } }
    for (const lang of ['ru', 'en'] as const) expect(menuFromCsv(menuToCsv(SLOTS, g, lang))['2-lunch'].variants).toEqual(g['2-lunch'].variants)
  })
  it('шаблон курса читается: строки с днём и приёмом, без блюд', () => {
    const g = menuFromCsv(template('menu-week.ru.csv'))
    expect(Object.keys(g).length).toBeGreaterThan(0)
    expect(Object.values(g).every((c) => c.dish === '' && c.priceCents === null)).toBe(true)
  })
  it('деньги: RU с запятой, EN с точкой, обратно в центы', () => {
    expect(menuMoney(1250, 'ru')).toBe('12,50')
    expect(menuMoney(1250, 'en')).toBe('12.50')
    expect(menuMoney(1200, 'ru')).toBe('12')
    expect([parseMoney('12,50'), parseMoney('12.5'), parseMoney(' 1 200 '), parseMoney('abc'), parseMoney('')]).toEqual([1250, 1250, 120000, null, null])
    expect(parseMoney('99999999999')).toBeNull()   // выше потолка — не сумма: ссылка и черновик её бы тихо выбросили
  })
})

describe('тексты проверок', () => {
  const IDS: MenuIssueId[] = ['day-without-price', 'empty-slot', 'allergen-without-alternative', 'diet-without-variant', 'diets-over-guests']
  it('у каждой проверки есть текст на обоих языках, фразы не длиннее 25 слов', () => {
    for (const lang of ['ru', 'en'] as const) {
      for (const id of IDS) {
        const t = issueText({ id, day: 2, meal: 'lunch', diet: 'vegan' }, lang)
        expect(t.length).toBeGreaterThan(0)
        for (const sentence of t.split(/[.!?]\s/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(25)
      }
    }
  })
})
