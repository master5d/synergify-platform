import { describe, expect, it } from 'vitest'
import { compute, profitGrid, validate, venueCost, venuePayments, type Inputs, type Venue } from './engine'

const usd = (n: number) => n * 100

// обезличенный пример: ставка $2 000, цена $2 800, кампус на 18 мест
const VENUE: Venue = {
  model: 'full_campus', ratePerGuest: usd(2000), capacity: 18, minGuests: 0, buyoutFee: 0,
  depositPct: 25, finalDueDays: 45, payInFullDiscountPct: 5, installments: false, payInFull: false,
}

function inputs(over: Partial<Inputs> = {}): Inputs {
  return {
    currency: 'USD', pricePerGuest: usd(2800), guests: 18, nights: 6, monthsToStart: 5,
    salesCurve: [3, 3, 4, 4, 4], guestDeposit: { kind: 'amount', value: usd(400) }, guestBalanceDueDays: 45,
    venue: VENUE, fixedCosts: [], perGuestCost: 0, revenuePct: 0, ...over,
  }
}

describe('модели контракта', () => {
  it('фикс за полный кампус — ставка × вместимость, сколько бы гостей ни пришло', () => {
    expect(venueCost(VENUE, 18)).toBe(usd(36000))
    expect(venueCost(VENUE, 12)).toBe(usd(36000))
  })
  it('за фактического гостя — не меньше минимума', () => {
    const v: Venue = { ...VENUE, model: 'per_guest', minGuests: 10 }
    expect(venueCost(v, 14)).toBe(usd(28000))
    expect(venueCost(v, 6)).toBe(usd(20000))
  })
  it('выкуп + за гостя', () => {
    expect(venueCost({ ...VENUE, model: 'buyout', buyoutFee: usd(8000), ratePerGuest: usd(700) }, 15)).toBe(usd(18500))
  })
})

describe('честная прибыль против «как считает площадка»', () => {
  it('наценка $800 × 18 гостей = $14 400; без расходов ведущего — то же', () => {
    const r = compute(inputs())
    expect(r.venueStyleProfit).toBe(usd(14400))
    expect(r.profit).toBe(usd(14400))
    expect(r.hiddenCosts).toBe(0)
  })
  it('расходы ведущего съедают «прибыль площадки»', () => {
    const r = compute(inputs({
      fixedCosts: [{ name: 'marketing', amount: usd(3000), monthsBeforeStart: 4 },
        { name: 'team flights', amount: usd(2500), monthsBeforeStart: 1 }],
      perGuestCost: usd(100), revenuePct: 5,
    }))
    // 50 400 выручка − 36 000 площадка − (5 500 + 1 800 + 2 520)
    expect(r.leaderCosts).toBe(usd(9820))
    expect(r.profit).toBe(usd(4580))
    expect(r.hiddenCosts).toBe(usd(9820))
  })
  it('площадка не показывает пустые места: наценка × проданные гости', () => {
    const r = compute(inputs({ guests: 12, salesCurve: [2, 2, 2, 3, 3] }))
    expect(r.venueStyleProfit).toBe(usd(9600))          // (2 800 − 2 000) × 12
    expect(r.profit).toBe(usd(33600 - 36000))
    expect(r.hiddenCosts).toBe(usd(12000))              // ровно цена 6 пустых мест
  })
  it('оплата контракта целиком: скидка входит в прибыль, касса сходится', () => {
    const r = compute(inputs({ venue: { ...VENUE, payInFull: true } }))
    expect(r.venueView.payInFullDiscount).toBe(usd(1800))
    expect(r.venueCost).toBe(usd(34200))
    expect(r.profit).toBe(usd(16200))
    expect(r.cashflow[r.cashflow.length - 1].balance).toBe(r.profit)
  })
})

describe('безубыточность и пустые места', () => {
  it('фикс за кампус: недобор платит ведущий', () => {
    const r = compute(inputs({ guests: 12, salesCurve: [2, 2, 2, 3, 3] }))
    expect(r.emptySeats).toBe(6)
    expect(r.emptySeatsCost).toBe(usd(12000))
    expect(r.breakEvenGuests).toBe(13)            // 13 × 2 800 = 36 400 ≥ 36 000
  })
  it('за фактического гостя с минимумом', () => {
    const v: Venue = { ...VENUE, model: 'per_guest', minGuests: 10 }
    const r = compute(inputs({ venue: v, fixedCosts: [{ name: 'marketing', amount: usd(4000), monthsBeforeStart: 3 }] }))
    // до 10 гостей площадка берёт за 10: 9 × 2 800 − 20 000 − 4 000 = +1 200, а 8 гостей — −1 600
    expect(r.breakEvenGuests).toBe(9)
    expect(r.emptySeats).toBe(0)
  })
  it('точка безубыточности далеко за 200 гостей находится', () => {
    const v: Venue = { ...VENUE, model: 'per_guest', ratePerGuest: usd(2300), minGuests: 0 }
    const r = compute(inputs({ venue: v, pricePerGuest: usd(2400), guests: 20, salesCurve: [4, 4, 4, 4, 4],
      fixedCosts: [{ name: 'marketing', amount: usd(30000), monthsBeforeStart: 3 }] }))
    expect(r.breakEvenGuests).toBe(300)           // 100 × 300 = 30 000
  })
  it('цена ниже полной ставки, но выше ставки со скидкой за оплату целиком — в ноль выйти можно', () => {
    const marketing = [{ name: 'marketing', amount: usd(30000), monthsBeforeStart: 3 }]
    const perGuest: Venue = { ...VENUE, model: 'per_guest', ratePerGuest: usd(2700), minGuests: 0,
      payInFull: true, payInFullDiscountPct: 10 }
    // ставка со скидкой 2 430: 170 × 177 = 30 090 ≥ 30 000, а 176 гостей — −80
    expect(compute(inputs({ venue: perGuest, pricePerGuest: usd(2600), guests: 20, salesCurve: [4, 4, 4, 4, 4],
      fixedCosts: marketing })).breakEvenGuests).toBe(177)
    // выкуп 5 000 тоже со скидкой (4 500): 170 × 203 = 34 510 ≥ 34 500
    const buyout: Venue = { ...perGuest, model: 'buyout', buyoutFee: usd(5000) }
    expect(compute(inputs({ venue: buyout, pricePerGuest: usd(2600), guests: 20, salesCurve: [4, 4, 4, 4, 4],
      fixedCosts: marketing })).breakEvenGuests).toBe(203)
  })
  it('маржа с гостя в доли цента — точка всё равно находится', () => {
    const v: Venue = { ...VENUE, model: 'per_guest', ratePerGuest: 269999, minGuests: 0, payInFull: true,
      payInFullDiscountPct: 7 }
    // 251 100 − 269 999 × 0,93 = 0,93 цента с гостя; $10 постоянных окупаются на 1 075-м
    expect(compute(inputs({ venue: v, pricePerGuest: 251100, guests: 20, salesCurve: [4, 4, 4, 4, 4],
      fixedCosts: [{ name: 'misc', amount: usd(10), monthsBeforeStart: 1 }] })).breakEvenGuests).toBe(1075)
  })
  it('совпадает с перебором прибыли по гостям на неудобных входах', () => {
    let seed = 7
    const rnd = (n: number) => { seed = (seed * 48271) % 2147483647; return seed % n }   // MINSTD, без потери точности
    const N = 20000
    for (let k = 0; k < 400; k++) {
      const model = (['full_campus', 'per_guest', 'buyout'] as const)[k % 3]
      const rate = 50000 + rnd(300000)
      const payInFull = rnd(2) === 1
      const discount = rnd(15) + rnd(100) / 100
      const revenuePct = rnd(5) + rnd(100) / 100
      const perGuestCost = rnd(3) ? 0 : rnd(5000)
      // каждый второй вход — маржа с гостя около нуля (±2 цента) и мелкие постоянные: класс, где ломался поиск
      const nearZero = k % 2 === 1
      const cost = (model === 'full_campus' ? 0 : rate * (payInFull ? 1 - discount / 100 : 1)) + perGuestCost
      const price = nearZero ? Math.round(cost / (1 - revenuePct / 100)) + rnd(5) - 2 : rate - 3000 + rnd(9000)
      const v: Venue = { ...VENUE, model, ratePerGuest: rate, capacity: 20 + rnd(9980), minGuests: rnd(40),
        buyoutFee: rnd(2) ? rnd(nearZero ? 5000 : 500000) : 0, payInFull, payInFullDiscountPct: discount }
      const i = inputs({ venue: v, pricePerGuest: Math.max(usd(401), price), guests: 20,
        salesCurve: [4, 4, 4, 4, 4], perGuestCost, revenuePct,
        fixedCosts: [{ name: 'misc', amount: rnd(nearZero ? 2000 : 3000000), monthsBeforeStart: 1 }] })
      const row = profitGrid(i, [i.pricePerGuest], Array.from({ length: N + 1 }, (_, g) => g))[0]
      const brute = row.findIndex((p) => p !== null && p >= 0)
      const got = compute(i).breakEvenGuests
      if (brute >= 0) expect(got, `вход ${k}`).toBe(brute)
      else expect(got === null || got > N, `вход ${k}: ${got}`).toBe(true)
    }
  }, 30_000)   // 400 входов × перебор до 20 001 гостя: в общем прогоне под нагрузкой не укладывается в 5 с по умолчанию (тест стоит в воротах деплоя академии)
  it('цена ниже ставки — в ноль не выйти', () => {
    expect(compute(inputs({ pricePerGuest: usd(1900) })).breakEvenGuests).toBeNull()
    const v: Venue = { ...VENUE, model: 'per_guest', minGuests: 10 }
    expect(compute(inputs({ venue: v, pricePerGuest: usd(1900) })).breakEvenGuests).toBeNull()
  })
})

describe('кассовый план', () => {
  it('депозит площадке при подписании, продажи в конце — кассовый разрыв в месяце остатка площадке', () => {
    const r = compute(inputs({ salesCurve: [0, 0, 0, 9, 9] }))
    // месяц 0: −9 000 депозит; месяц 3 (за 45 дней до старта): −27 000 остаток, +25 200 продажи
    expect(r.cashGap).toEqual({ amount: usd(10800), month: 3 })
    expect(r.cashflow[r.cashflow.length - 1].balance).toBe(r.profit)
  })
  it('гость, купивший после срока доплаты, платит целиком сразу', () => {
    const r = compute(inputs({ salesCurve: [0, 0, 0, 0, 18] }))
    expect(r.cashflow[4].inflow).toBe(usd(50400))
  })
  it('итог кассы совпадает с честной прибылью до цента — и на неудобных процентах', () => {
    const cases: Partial<Inputs>[] = [
      { fixedCosts: [{ name: 'insurance', amount: usd(1234), monthsBeforeStart: 2 }], perGuestCost: usd(77),
        revenuePct: 3.3, venue: { ...VENUE, installments: true } },
      { pricePerGuest: 150015, guests: 3, monthsToStart: 3, salesCurve: [1, 1, 1], revenuePct: 3.7,
        guestDeposit: { kind: 'pct', value: 30 } },
    ]
    for (const c of cases) {
      const r = compute(inputs(c))
      expect(r.cashflow[r.cashflow.length - 1].balance).toBe(r.profit)
    }
  })
})

describe('взгляд площадки', () => {
  it('график: депозит 25 % при подписании, остаток за 45 дней до старта', () => {
    expect(compute(inputs()).venueView.schedule).toEqual([{ month: 0, amount: usd(9000) }, { month: 3, amount: usd(27000) }])
  })
  it('рассрочка равными долями до финального платежа, без потери центов', () => {
    const r = compute(inputs({ venue: { ...VENUE, installments: true, ratePerGuest: 100_001 } }))
    expect(r.venueView.schedule.reduce((s, p) => s + p.amount, 0)).toBe(r.venueView.contractValue)
    expect(r.venueView.schedule.map((p) => p.month)).toEqual([0, 1, 2, 3])
  })
  it('финальный срок уже в месяце подписания — один платёж, без дублей месяца', () => {
    const r = compute(inputs({ monthsToStart: 1, salesCurve: [18], venue: { ...VENUE, finalDueDays: 60 } }))
    expect(r.venueView.schedule).toEqual([{ month: 0, amount: usd(36000) }])
  })
})

describe('проверка входов', () => {
  it('ошибки называют поле, а не дают NaN', () => {
    expect(validate(inputs({ guests: 25, salesCurve: [25] }))).toContain('guests: 25 больше вместимости 18')
    expect(validate(inputs({ salesCurve: [1, 2] }))).toContain('salesCurve: продано 3, а гостей 18')
    expect(validate(inputs({ revenuePct: 120 }))).toContain('revenuePct: ожидался процент 0–100')
    expect(validate(inputs({ pricePerGuest: 10.5 }))).toContain('pricePerGuest: ожидалась неотрицательная сумма')
    expect(() => compute(inputs({ monthsToStart: 0 }))).toThrow('monthsToStart')
  })
  it('потолки: огромные числа — ошибка поля, а не зависание', () => {
    const v: Venue = { ...VENUE, model: 'per_guest' }
    expect(validate(inputs({ venue: v, guests: 1e9, salesCurve: [1e9] }))).toContain('guests: больше допустимого (10000)')
    expect(validate(inputs({ monthsToStart: 1e10 }))).toContain('monthsToStart: больше допустимого (120)')
  })
  it('сообщения на английском для EN-страницы', () => {
    expect(validate(inputs({ guests: 25, salesCurve: [25] }), 'en')).toContain('guests: 25 is above capacity 18')
  })
  it('суммы до $1 000 000 без потери центов', () => {
    const r = compute(inputs({ pricePerGuest: 4_999_999, venue: { ...VENUE, ratePerGuest: 1 } }))
    expect(r.revenue).toBe(89_999_982)
  })
})

describe('сетка «цена × гости»', () => {
  it('клетки с гостями сверх вместимости пустые', () => {
    const g = profitGrid(inputs(), [usd(2600), usd(2800)], [16, 18, 20])
    expect(g[1][1]).toBe(usd(14400))
    expect(g[0][2]).toBeNull()
  })
})

describe('venuePayments — график площадки для таймлайна', () => {
  const venue: Venue = { ...VENUE, ratePerGuest: usd(1800), capacity: 20, depositPct: 25, finalDueDays: 60, installments: true }
  it('депозит при подписании и четыре равных взноса до финального срока', () => {
    expect(venuePayments(venue, 20, 6).schedule).toEqual([
      { month: 0, amount: 900000 }, { month: 1, amount: 675000 }, { month: 2, amount: 675000 },
      { month: 3, amount: 675000 }, { month: 4, amount: 675000 },
    ])
  })
  it('калькулятор считает тот же график', () => {
    const r = compute(inputs({ venue, guests: 20, monthsToStart: 6, salesCurve: [4, 4, 4, 4, 4] }))
    expect(r.venueView.schedule).toEqual(venuePayments(venue, 20, 6).schedule)
  })
  it('поздний договор после финального срока оставляет депозит и остаток двумя платежами месяца 0', () => {
    expect(venuePayments({ ...venue, installments: false, finalDueDays: 60 }, 20, 1, 61).schedule)
      .toEqual([{ month: 0, amount: 900000 }, { month: 0, amount: 2700000 }])
  })
  it('если до старта меньше финального срока, остаток объединяется с депозитом', () => {
    expect(venuePayments({ ...venue, installments: false, finalDueDays: 60 }, 20, 1, 59).schedule)
      .toEqual([{ month: 0, amount: 3600000 }])
  })
  it('без точного числа дней сохраняется прежний месячный результат', () => {
    expect(venuePayments(venue, 20, 6).schedule).toEqual([
      { month: 0, amount: 900000 }, { month: 1, amount: 675000 }, { month: 2, amount: 675000 },
      { month: 3, amount: 675000 }, { month: 4, amount: 675000 },
    ])
  })
})

describe('поздний договор без срока в днях', () => {
  it('без daysToStart остаток в месяце подписания сливается с задатком в один платёж, как до правки', () => {
    const r = venuePayments(VENUE, 18, 1)
    expect(r.schedule).toEqual([{ month: 0, amount: usd(36000) }])
  })
})
