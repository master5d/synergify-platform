// Калькулятор экономики ретрита: один движок, два взгляда — ведущий и площадка.
// Только детерминированная арифметика: деньги — целые центы, проценты округляются «половина вверх» к центу.
// Кассовый план считается по месяцам от подписания контракта (месяц 0) до старта (месяц monthsToStart).

export type ContractModel = 'full_campus' | 'per_guest' | 'buyout'
export type Lang = 'ru' | 'en'

/** Потолки входов: ссылка и форма не должны ронять или вешать страницу (1e10 месяцев, миллиард гостей). */
export const LIMITS = { guests: 10_000, months: 120, nights: 365, days: 3_650, moneyCents: 1_000_000_000 } as const

export interface Venue {
  model: ContractModel
  /** Ставка площадки за гостя (центы). У `buyout` — доплата за каждого гостя сверх взноса. */
  ratePerGuest: number
  /** `full_campus`: контракт считается по полной вместимости. */
  capacity: number
  /** `per_guest`: оплачивается не меньше этого числа гостей. */
  minGuests: number
  /** `buyout`: взнос за площадку целиком (центы). */
  buyoutFee: number
  /** Депозит площадке при подписании, % контракта. */
  depositPct: number
  /** Полная оплата площадке — за столько дней до старта. */
  finalDueDays: number
  /** Скидка за оплату контракта целиком при подписании, %. */
  payInFullDiscountPct: number
  /** Остаток после депозита — равными долями по месяцам до финального платежа (иначе одним платежом). */
  installments: boolean
  /** Ведущий платит контракт целиком при подписании (со скидкой). */
  payInFull: boolean
}

export interface CostLine {
  name: string
  /** Сумма (центы). */
  amount: number
  /** За сколько месяцев до старта платится (0 — в месяц старта). */
  monthsBeforeStart: number
}

export interface Inputs {
  currency: string
  /** Цена за гостя (центы). */
  pricePerGuest: number
  /** Платящие гости. */
  guests: number
  nights: number
  /** Месяцев от подписания контракта до старта (≥ 1). */
  monthsToStart: number
  /** Сколько гостей покупает в каждый месяц: индекс 0 — месяц подписания; длина ≤ monthsToStart; сумма = guests. */
  salesCurve: number[]
  /** Депозит гостя: процент цены или сумма (центы). */
  guestDeposit: { kind: 'pct' | 'amount'; value: number }
  /** Доплата гостя — за столько дней до старта. */
  guestBalanceDueDays: number
  venue: Venue
  fixedCosts: CostLine[]
  /** Расходы ведущего на каждого гостя (центы): подарки, включённые экскурсии. */
  perGuestCost: number
  /** Процент с выручки: эквайринг и резерв на возвраты. */
  revenuePct: number
}

export interface CashMonth { month: number; inflow: number; outflow: number; balance: number }

export interface VenueView {
  contractValue: number
  /** Сумма к оплате с учётом выбранного варианта (скидка за полную оплату). */
  payable: number
  payInFullDiscount: number
  schedule: { month: number; amount: number }[]
}

export interface Result {
  revenue: number
  /** Что ведущий платит площадке (со скидкой, если платит целиком). */
  venueCost: number
  leaderCosts: number
  /** Честная прибыль ведущего: выручка − площадка − все расходы ведущего. */
  profit: number
  /** «Прибыль», как её считает площадка: наценка над ставкой × гости (у `buyout` — выручка − контракт). */
  venueStyleProfit: number
  /** Разница: что «прибыль площадки» не показывает — ваши расходы и пустые места. */
  hiddenCosts: number
  /** Минимум платящих гостей для прибыли ≥ 0; null — не выходит в ноль ни при каком числе гостей. */
  breakEvenGuests: number | null
  /** `full_campus`: места, оплаченные ведущим, но не проданные, и их цена. */
  emptySeats: number
  emptySeatsCost: number
  cashflow: CashMonth[]
  /** Минимум накопленного остатка ниже нуля: сумма (положительная) и месяц; null — разрыва нет. */
  cashGap: { amount: number; month: number } | null
  venueView: VenueView
}

/** Процент от суммы в центах, «половина вверх» к центу. */
export function pct(amountCents: number, percent: number): number {
  return Math.round((amountCents * percent) / 100)
}

/** Месяцев до старта, за которые нужно заплатить за `days` дней (30 дней = месяц, вверх). */
export function monthsBefore(days: number): number {
  return Math.max(0, Math.ceil(days / 30))
}

/** Полная сумма контракта с площадкой (до скидки за оплату целиком). */
export function venueCost(venue: Venue, guests: number): number {
  if (venue.model === 'full_campus') return venue.ratePerGuest * venue.capacity
  if (venue.model === 'per_guest') return venue.ratePerGuest * Math.max(guests, venue.minGuests)
  return venue.buyoutFee + venue.ratePerGuest * guests
}

/** Что ведущий реально платит площадке: со скидкой, если платит контракт целиком при подписании. */
function venuePayable(venue: Venue, guests: number): number {
  const cost = venueCost(venue, guests)
  return venue.payInFull ? cost - pct(cost, venue.payInFullDiscountPct) : cost
}

function leaderCosts(i: Inputs, guests: number): number {
  const fixed = i.fixedCosts.reduce((s, c) => s + c.amount, 0)
  return fixed + i.perGuestCost * guests + pct(i.pricePerGuest * guests, i.revenuePct)
}

function profitAt(i: Inputs, guests: number): number {
  return i.pricePerGuest * guests - venuePayable(i.venue, guests) - leaderCosts(i, guests)
}

const MESSAGES = {
  ru: {
    money: (f: string) => `${f}: ожидалась неотрицательная сумма`,
    count: (f: string) => `${f}: ожидалось целое ≥ 0`,
    percent: (f: string) => `${f}: ожидался процент 0–100`,
    tooBig: (f: string, max: number) => `${f}: больше допустимого (${max})`,
    months: 'monthsToStart: ожидалось целое ≥ 1',
    curveLong: 'salesCurve: месяцев продаж больше, чем месяцев до старта',
    sold: (sold: number, guests: number) => `salesCurve: продано ${sold}, а гостей ${guests}`,
    depositOverPrice: 'guestDeposit: депозит больше цены',
    capacity: 'venue.capacity: ожидалось целое ≥ 1',
    overCapacity: (g: number, c: number) => `guests: ${g} больше вместимости ${c}`,
  },
  en: {
    money: (f: string) => `${f}: expected a non-negative amount`,
    count: (f: string) => `${f}: expected an integer ≥ 0`,
    percent: (f: string) => `${f}: expected a percentage 0–100`,
    tooBig: (f: string, max: number) => `${f}: above the allowed maximum (${max})`,
    months: 'monthsToStart: expected an integer ≥ 1',
    curveLong: 'salesCurve: more sales months than months to start',
    sold: (sold: number, guests: number) => `salesCurve: ${sold} sold, but ${guests} guests`,
    depositOverPrice: 'guestDeposit: deposit is above the price',
    capacity: 'venue.capacity: expected an integer ≥ 1',
    overCapacity: (g: number, c: number) => `guests: ${g} is above capacity ${c}`,
  },
}

/** Ошибки входов с именем поля (на языке страницы); пустой список — можно считать. */
export function validate(i: Inputs, lang: Lang = 'ru'): string[] {
  const t = MESSAGES[lang]
  const errors: string[] = []
  const money = (name: string, v: number) => {
    if (!Number.isInteger(v) || v < 0) errors.push(t.money(name))
    else if (v > LIMITS.moneyCents) errors.push(t.tooBig(name, LIMITS.moneyCents / 100))
  }
  const count = (name: string, v: number, max: number) => {
    if (!Number.isInteger(v) || v < 0) errors.push(t.count(name))
    else if (v > max) errors.push(t.tooBig(name, max))
  }
  const percent = (name: string, v: number) => {
    if (!Number.isFinite(v) || v < 0 || v > 100) errors.push(t.percent(name))
  }
  money('pricePerGuest', i.pricePerGuest)
  count('guests', i.guests, LIMITS.guests)
  count('nights', i.nights, LIMITS.nights)
  if (!Number.isInteger(i.monthsToStart) || i.monthsToStart < 1) errors.push(t.months)
  else if (i.monthsToStart > LIMITS.months) errors.push(t.tooBig('monthsToStart', LIMITS.months))
  if (i.salesCurve.length > i.monthsToStart) errors.push(t.curveLong)
  i.salesCurve.forEach((n, k) => count(`salesCurve[${k}]`, n, LIMITS.guests))
  const sold = i.salesCurve.reduce((s, n) => s + n, 0)
  if (sold !== i.guests) errors.push(t.sold(sold, i.guests))
  if (i.guestDeposit.kind === 'pct') percent('guestDeposit', i.guestDeposit.value)
  else money('guestDeposit', i.guestDeposit.value)
  if (i.guestDeposit.kind === 'amount' && i.guestDeposit.value > i.pricePerGuest) errors.push(t.depositOverPrice)
  count('guestBalanceDueDays', i.guestBalanceDueDays, LIMITS.days)
  const v = i.venue
  money('venue.ratePerGuest', v.ratePerGuest)
  if (v.model === 'full_campus') {
    if (!Number.isInteger(v.capacity) || v.capacity < 1) errors.push(t.capacity)
    else if (v.capacity > LIMITS.guests) errors.push(t.tooBig('venue.capacity', LIMITS.guests))
    else if (i.guests > v.capacity) errors.push(t.overCapacity(i.guests, v.capacity))
  }
  if (v.model === 'per_guest') count('venue.minGuests', v.minGuests, LIMITS.guests)
  if (v.model === 'buyout') money('venue.buyoutFee', v.buyoutFee)
  percent('venue.depositPct', v.depositPct)
  percent('venue.payInFullDiscountPct', v.payInFullDiscountPct)
  count('venue.finalDueDays', v.finalDueDays, LIMITS.days)
  i.fixedCosts.forEach((c, k) => {
    money(`fixedCosts[${k}].amount`, c.amount)
    count(`fixedCosts[${k}].monthsBeforeStart`, c.monthsBeforeStart, LIMITS.months)
  })
  money('perGuestCost', i.perGuestCost)
  percent('revenuePct', i.revenuePct)
  return errors
}

function venueSchedule(i: Inputs): VenueView {
  const v = i.venue
  const contractValue = venueCost(v, i.guests)
  const finalMonth = Math.max(0, i.monthsToStart - monthsBefore(v.finalDueDays))
  if (v.payInFull) {
    const payable = venuePayable(v, i.guests)
    return { contractValue, payable, payInFullDiscount: contractValue - payable, schedule: [{ month: 0, amount: payable }] }
  }
  const deposit = pct(contractValue, v.depositPct)
  const rest = contractValue - deposit
  const schedule = [{ month: 0, amount: deposit }]
  if (rest > 0) {
    if (v.installments && finalMonth > 0) {
      const share = Math.floor(rest / finalMonth)
      for (let m = 1; m <= finalMonth; m++) {
        schedule.push({ month: m, amount: m === finalMonth ? rest - share * (finalMonth - 1) : share })
      }
    } else if (finalMonth === 0) {
      schedule[0].amount += rest                          // финальный срок уже наступил — всё при подписании
    } else {
      schedule.push({ month: finalMonth, amount: rest })
    }
  }
  return { contractValue, payable: contractValue, payInFullDiscount: 0, schedule }
}

function cashflow(i: Inputs, venue: VenueView): CashMonth[] {
  const months = i.monthsToStart
  const inflow = new Array(months + 1).fill(0)
  const outflow = new Array(months + 1).fill(0)
  const deposit = i.guestDeposit.kind === 'pct' ? pct(i.pricePerGuest, i.guestDeposit.value) : i.guestDeposit.value
  const balanceMonth = Math.max(0, months - monthsBefore(i.guestBalanceDueDays))
  i.salesCurve.forEach((sold, m) => {
    // гость, купивший после срока доплаты, платит целиком сразу
    if (m >= balanceMonth) {
      inflow[m] += i.pricePerGuest * sold
    } else {
      inflow[m] += deposit * sold
      inflow[balanceMonth] += (i.pricePerGuest - deposit) * sold
    }
  })
  // эквайринг и резерв на возвраты: итог считается от всей выручки (как в прибыли), по месяцам — пропорционально
  // поступлениям, остаток округления — в последний месяц с поступлением; касса сходится с прибылью до цента
  const revenue = i.pricePerGuest * i.guests
  const fee = pct(revenue, i.revenuePct)
  let allocated = 0
  let last = -1
  inflow.forEach((inc, m) => {
    if (inc > 0) {
      const share = Math.floor((fee * inc) / revenue)
      outflow[m] += share
      allocated += share
      last = m
    }
  })
  if (last >= 0) outflow[last] += fee - allocated
  venue.schedule.forEach((p) => { outflow[p.month] += p.amount })
  i.fixedCosts.forEach((c) => { outflow[Math.max(0, months - c.monthsBeforeStart)] += c.amount })
  outflow[months] += i.perGuestCost * i.guests
  let balance = 0
  return inflow.map((inc, m) => {
    balance += inc - outflow[m]
    return { month: m, inflow: inc, outflow: outflow[m], balance }
  })
}

/** Наименьшее число гостей с прибылью ≥ 0 — тот же ответ, что дал бы перебор profitAt по g = 0…hi. До минимума
 *  per_guest площадка берёт фикс: там прямой перебор (минимум ≤ 10 000). Дальше прибыль = m·g − F (m — точная
 *  маржа с гостя, F — постоянные), а округления к центу (эквайринг, скидка площадки) сдвигают её не больше чем на
 *  цент: при m·g − F < −1,5 убыток точно, при ≥ 1,5 прибыль точно. Ответ ищется перебором в окне между ними —
 *  и при марже в доли цента тоже (окно тогда широкое, но не шире hi). */
function breakEven(i: Inputs): number | null {
  const v = i.venue
  const hi = v.model === 'full_campus' ? v.capacity : LIMITS.guests * 100
  const floor = v.model === 'per_guest' ? Math.min(v.minGuests, hi) : 0
  for (let g = 0; g < floor; g++) if (profitAt(i, g) >= 0) return g
  const keep = v.payInFull ? 1 - v.payInFullDiscountPct / 100 : 1
  const fixed = i.fixedCosts.reduce((s, c) => s + c.amount, 0)
    + (v.model === 'full_campus' ? v.ratePerGuest * v.capacity * keep : v.model === 'buyout' ? v.buyoutFee * keep : 0)
  const margin = i.pricePerGuest * (1 - i.revenuePct / 100) - i.perGuestCost
    - (v.model === 'full_campus' ? 0 : v.ratePerGuest * keep)
  const SLACK = 1.5                                   // ≥ суммы двух округлений к центу (по ½) с запасом на float
  let from = floor
  let to = hi
  if (margin > 0) {
    from = Math.max(floor, Math.floor((fixed - SLACK) / margin))
    to = Math.min(hi, Math.max(from, Math.ceil((fixed + SLACK) / margin) + 1))   // окупилось уже на минимуме — смотрим его
  } else if (margin < 0) {
    to = Math.min(hi, Math.floor((fixed - SLACK) / margin) + 1)   // дальше убыток только растёт
  } else if (fixed > SLACK) {
    return null
  }
  for (let g = from; g <= to; g++) if (profitAt(i, g) >= 0) return g
  return null
}

export function compute(i: Inputs, lang: Lang = 'ru'): Result {
  const errors = validate(i, lang)
  if (errors.length) throw new Error(errors.join('; '))
  const revenue = i.pricePerGuest * i.guests
  const vPaid = venuePayable(i.venue, i.guests)
  const lCosts = leaderCosts(i, i.guests)
  const profit = revenue - vPaid - lCosts
  // как считает площадка: наценка над ставкой на каждого гостя; пустые места и расходы ведущего не видны
  const venueStyleProfit = i.venue.model === 'buyout'
    ? revenue - venueCost(i.venue, i.guests)
    : (i.pricePerGuest - i.venue.ratePerGuest) * i.guests
  const emptySeats = i.venue.model === 'full_campus' ? i.venue.capacity - i.guests : 0
  const view = venueSchedule(i)
  const flow = cashflow(i, view)
  const worst = flow.reduce((w, c) => (c.balance < w.balance ? c : w), flow[0])
  return {
    revenue,
    venueCost: vPaid,
    leaderCosts: lCosts,
    profit,
    venueStyleProfit,
    hiddenCosts: venueStyleProfit - profit,
    breakEvenGuests: breakEven(i),
    emptySeats,
    emptySeatsCost: emptySeats * i.venue.ratePerGuest,
    cashflow: flow,
    cashGap: worst.balance < 0 ? { amount: -worst.balance, month: worst.month } : null,
    venueView: view,
  }
}

/** Сетка честной прибыли «цена × гости» (центы); клетка с невозможным числом гостей — null. */
export function profitGrid(i: Inputs, prices: number[], guestCounts: number[]): (number | null)[][] {
  return prices.map((price) => guestCounts.map((g) => {
    if (i.venue.model === 'full_campus' && g > i.venue.capacity) return null
    return profitAt({ ...i, pricePerGuest: price }, g)
  }))
}
