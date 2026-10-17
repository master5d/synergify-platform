import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compute } from './engine'
import { applyLink, DEFAULT_FORM, toInputs } from './form'
import { decodeLink, encodeLink, type LinkData } from './link'

// Учебные сделки курса «Ретрит с двух сторон» (LMS pack retreat) ведут на эту страницу ссылкой #data=.
// Цифры итогов названы в тексте уроков — тест держит их равными тому, что покажет страница:
// ссылка → слияние с формой по умолчанию → движок. Меняешь движок или форму по умолчанию — тест скажет,
// какие уроки врут.
const EXAMPLES = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'course', 'calc-examples.json')

interface Example {
  id: string
  title: { ru: string; en: string }
  data: Omit<LinkData, 'title'>
  expect: {
    profit: number
    venueStyleProfit: number
    breakEvenGuests: number | null
    emptySeats: number
    cashGap: { amount: number; month: number } | null
  }
}

const examples = JSON.parse(readFileSync(EXAMPLES, 'utf8')) as Example[]

describe('учебные сделки курса retreat', () => {
  it('файл примеров не пуст и id уникальны', () => {
    expect(examples.length).toBeGreaterThan(0)
    expect(new Set(examples.map((e) => e.id)).size).toBe(examples.length)
  })

  for (const ex of examples) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${ex.id} (${locale}): ссылка проходит разбор страницы без потерь`, () => {
        const data: LinkData = { ...ex.data, title: ex.title[locale] }
        expect(decodeLink(encodeLink(data), locale)).toEqual({ ok: true, data })
      })
    }

    it(`${ex.id}: итоги страницы равны expect`, () => {
      const decoded = decodeLink(encodeLink({ ...ex.data, title: ex.title.ru }))
      if (!decoded.ok) throw new Error(decoded.error)
      const r = compute(toInputs(applyLink(DEFAULT_FORM, decoded.data)))
      expect({
        profit: r.profit / 100,
        venueStyleProfit: r.venueStyleProfit / 100,
        breakEvenGuests: r.breakEvenGuests,
        emptySeats: r.emptySeats,
        cashGap: r.cashGap ? { amount: r.cashGap.amount / 100, month: r.cashGap.month } : null,
      }).toEqual(ex.expect)
    })
  }
})

describe('applyLink', () => {
  it('поля, которых нет в ссылке, остаются из формы', () => {
    const f = applyLink(DEFAULT_FORM, { v: 1, price: 3000 })
    expect(f.price).toBe('3000')
    expect(f.guests).toBe(DEFAULT_FORM.guests)
    expect(f.revenuePct).toBe(DEFAULT_FORM.revenuePct)
  })
  it('сумма депозита гостя важнее процента', () => {
    const f = applyLink(DEFAULT_FORM, { v: 1, guestDeposit: 500, guestDepositPct: 30 })
    expect([f.depositMode, f.deposit]).toEqual(['amount', '500'])
  })
})
