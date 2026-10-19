import { describe, expect, it } from 'vitest'
import { cellKey, computeMenu, emptyCell, menuSlots, type MenuCell, type MenuGrid } from './engine'

const PASSPORT = { start: '2028-05-10', nights: 6, guests: 16, currency: 'USD' }
const PRICE = { breakfast: 1200, lunch: 1800, dinner: 1600 } as const

// учебная неделя: растительная основа, к ужину во дни 2–6 — мясо за доплату
function week(over: (cell: MenuCell, key: string) => MenuCell = (c) => c): MenuGrid {
  const grid: MenuGrid = {}
  for (const s of menuSlots(PASSPORT)) {
    const cell: MenuCell = {
      ...emptyCell(), dish: `блюдо ${s.day} ${s.meal}`, priceCents: PRICE[s.meal],
      option: s.meal === 'dinner' && s.day >= 2 && s.day <= 6 ? { name: 'мясо к ужину', priceCents: 800 } : null,
    }
    grid[cellKey(s)] = over(cell, cellKey(s))
  }
  return grid
}

describe('сетка приёмов пищи', () => {
  it('6 ночей: заезд с обеда, выезд после завтрака — по шесть завтраков, обедов и ужинов', () => {
    const slots = menuSlots({ nights: 6 })
    expect(slots).toHaveLength(18)
    expect(slots.slice(0, 2)).toEqual([{ day: 1, meal: 'lunch' }, { day: 1, meal: 'dinner' }])
    expect(slots.at(-1)).toEqual({ day: 7, meal: 'breakfast' })
    for (const meal of ['breakfast', 'lunch', 'dinner'] as const) expect(slots.filter((s) => s.meal === meal)).toHaveLength(6)
  })
  it('1 ночь, заезд на ужин, выезд после обеда', () => {
    expect(menuSlots({ nights: 1, arrivalMeal: 'dinner', departureMeal: 'lunch' }))
      .toEqual([{ day: 1, meal: 'dinner' }, { day: 2, meal: 'breakfast' }, { day: 2, meal: 'lunch' }])
  })
  it('без ночей — пусто', () => {
    expect(menuSlots({})).toEqual([])
  })
})

describe('итоги в трёх разрезах', () => {
  const r = computeMenu(PASSPORT, week(), {})
  it('на гостя по дням, за неделю и на группу', () => {
    expect(r.totals.perGuestByDay.map((d) => d.cents)).toEqual([3400, 4600, 4600, 4600, 4600, 4600, 1200])
    expect(r.totals.perGuestWeek).toBe(27600)
    expect(r.totals.perGroup).toBe(441600)
  })
  it('опции за доплату — отдельно и не входят в итоги', () => {
    expect(r.totals.options).toHaveLength(5)
    expect(r.totals.options.every((o) => o.meal === 'dinner' && o.priceCents === 800)).toBe(true)
    expect(r.issues).toEqual([])
  })
})

describe('проверки', () => {
  it('обед без цены: день и неделя не считаются из части цен', () => {
    const r = computeMenu(PASSPORT, week((c, k) => (k === '3-lunch' ? { ...c, priceCents: null } : c)), {})
    expect(r.totals.perGuestByDay[2]).toEqual({ day: 3, cents: null })
    expect(r.totals.perGuestWeek).toBeNull()
    expect(r.totals.perGroup).toBeNull()
    expect(r.issues).toEqual([{ id: 'day-without-price', day: 3 }])
  })
  it('пустой приём: замечание, и итог дня и недели не считается', () => {
    const r = computeMenu(PASSPORT, week((c, k) => (k === '2-breakfast' ? emptyCell() : c)), {})
    expect(r.issues).toContainEqual({ id: 'empty-slot', day: 2, meal: 'breakfast' })
    expect(r.totals.perGuestByDay[1]).toEqual({ day: 2, cents: null })
    expect(r.totals.perGuestWeek).toBeNull()
  })
  it('рыба без галочки «мясное» — всё равно нужен вариант для вегетарианцев', () => {
    const r = computeMenu(PASSPORT, week((c, k) => (k === '4-lunch' ? { ...c, allergens: ['fish'], variants: { 'gluten-free': 'то же' } } : c)), { vegetarian: 1 })
    expect(r.issues).toEqual([
      { id: 'allergen-without-alternative', day: 4, meal: 'lunch' },
      { id: 'diet-without-variant', day: 4, meal: 'lunch', diet: 'vegetarian' },
    ])
  })
  it('вариант «без глютена» снимает только глютен: сельдерей с ним — без замены', () => {
    const at = (allergens: ('gluten' | 'celery')[], variants: Record<string, string>) =>
      computeMenu(PASSPORT, week((c, k) => (k === '5-lunch' ? { ...c, allergens, variants } : c)), {}).issues
    expect(at(['gluten'], { 'gluten-free': 'рис' })).toEqual([])
    expect(at(['celery'], { 'gluten-free': 'рис' })).toEqual([{ id: 'allergen-without-alternative', day: 5, meal: 'lunch' }])
    expect(at(['celery'], { vegan: 'без сельдерея' })).toEqual([])
  })
  it('веганский вариант годится вегетарианцам; веганам мясное без варианта — замечание', () => {
    const meat = (variants: Record<string, string>) => week((c, k) => (k === '4-lunch' ? { ...c, meat: true, variants } : c))
    expect(computeMenu(PASSPORT, meat({ vegan: 'Плов с нутом' }), { vegetarian: 2, vegan: 1 }).issues).toEqual([])
    expect(computeMenu(PASSPORT, meat({}), { vegan: 1 }).issues).toEqual([{ id: 'diet-without-variant', day: 4, meal: 'lunch', diet: 'vegan' }])
  })
  it('веганы в группе и блюдо с молоком: без варианта — замечание, с вариантом — нет', () => {
    const withMilk = (variant?: string) => week((c, k) => (k === '2-breakfast' ? { ...c, allergens: ['milk'], variants: variant ? { vegan: variant } : {} } : c))
    expect(computeMenu(PASSPORT, withMilk(), { vegan: 2 }).issues).toEqual([
      { id: 'allergen-without-alternative', day: 2, meal: 'breakfast' },
      { id: 'diet-without-variant', day: 2, meal: 'breakfast', diet: 'vegan' },
    ])
    expect(computeMenu(PASSPORT, withMilk('каша на овсяном молоке'), { vegan: 2 }).issues).toEqual([])
  })
  it('мясное блюдо требует варианта для вегетарианцев и веганов', () => {
    const r = computeMenu(PASSPORT, week((c, k) => (k === '4-lunch' ? { ...c, meat: true } : c)), { vegetarian: 3 })
    expect(r.issues).toEqual([{ id: 'diet-without-variant', day: 4, meal: 'lunch', diet: 'vegetarian' }])
  })
  it('особых диет больше, чем гостей', () => {
    expect(computeMenu(PASSPORT, week(), { vegan: 10, 'gluten-free': 8 }).issues).toContainEqual({ id: 'diets-over-guests' })
  })
  it('комбинированная диета требует свой вариант, если блюдо содержит глютен и молоко', () => {
    const grid = week((c, k) => k === '2-breakfast' ? { ...c, allergens: ['gluten', 'milk'] } : c)
    expect(computeMenu(PASSPORT, grid, { 'vegan-gluten-free': 1 }).issues).toContainEqual({ id: 'diet-without-variant', day: 2, meal: 'breakfast', diet: 'vegan-gluten-free' })
  })
  it('свой вариант комбинированной диеты закрывает глютен и молоко', () => {
    const grid = week((c, k) => k === '2-breakfast' ? { ...c, allergens: ['gluten', 'milk'], variants: { 'vegan-gluten-free': 'каша' } } : c)
    expect(computeMenu(PASSPORT, grid, { 'vegan-gluten-free': 1 }).issues).toEqual([])
  })
  it('отдельные веганский и безглютеновый варианты не заменяют комбинированный', () => {
    const grid = week((c, k) => k === '2-breakfast' ? { ...c, allergens: ['gluten', 'milk'], variants: { vegan: 'каша', 'gluten-free': 'рис' } } : c)
    expect(computeMenu(PASSPORT, grid, { 'vegan-gluten-free': 1 }).issues).toContainEqual({ id: 'diet-without-variant', day: 2, meal: 'breakfast', diet: 'vegan-gluten-free' })
  })
  it('гость с комбинированной диетой считается один раз', () => {
    expect(computeMenu({ ...PASSPORT, guests: 1 }, week(), { 'vegan-gluten-free': 1 }).issues).not.toContainEqual({ id: 'diets-over-guests' })
  })
  it('аллерген варианта делает замену небезопасной, строковый вариант остаётся совместимым', () => {
    const withObject = week((c, k) => k === '2-breakfast' ? { ...c, allergens: ['milk'], variants: { vegan: { name: 'каша', allergens: ['milk'] } } } : c)
    expect(computeMenu(PASSPORT, withObject, {}).issues).toContainEqual({ id: 'allergen-without-alternative', day: 2, meal: 'breakfast' })
    const withString = week((c, k) => k === '2-breakfast' ? { ...c, allergens: ['milk'], variants: { vegan: 'каша' } } : c)
    expect(computeMenu(PASSPORT, withString, {}).issues).not.toContainEqual({ id: 'allergen-without-alternative', day: 2, meal: 'breakfast' })
  })
  it('опция без блюда попадает в итоги и даёт отдельное замечание', () => {
    const r = computeMenu(PASSPORT, week((c, k) => k === '2-breakfast' ? { ...emptyCell(), option: { name: 'соус', priceCents: 100 } } : c), {})
    expect(r.totals.options).toContainEqual({ day: 2, meal: 'breakfast', name: 'соус', priceCents: 100 })
    expect(r.issues).toContainEqual({ id: 'option-without-dish', day: 2, meal: 'breakfast' })
  })
  it('невалидный вход — исключение', () => {
    expect(() => computeMenu({ ...PASSPORT, guests: undefined }, {}, {})).toThrow(/guests/)
    expect(() => computeMenu(PASSPORT, {}, { vegan: -1 })).toThrow(/diets\.vegan/)
  })
})
