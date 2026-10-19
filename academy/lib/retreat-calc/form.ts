// Форма калькулятора ретрита без React: значения по умолчанию, слияние ссылки `#data=` с формой и
// перевод формы во входы движка. Живёт отдельно от компонента, чтобы тесты (в т.ч. сверка учебных
// примеров курса academy/retreat) считали ровно то, что покажет страница.
import { LIMITS, type ContractModel, type Inputs } from './engine'
import type { LinkData } from './link'

export type SalesPreset = 'even' | 'late' | 'early' | 'manual'

export interface CostRow { name: string; amount: string; monthsBeforeStart: string }
export interface AccommodationRow { name: string; guests: string; surcharge: string; cost: string }

export interface Form {
  title: string
  currency: string
  price: string
  guests: string
  nights: string
  monthsToStart: string
  daysToStart?: number
  depositMode: 'pct' | 'amount'
  deposit: string
  balanceDueDays: string
  model: ContractModel
  rate: string
  capacity: string
  minGuests: string
  buyoutFee: string
  venueDepositPct: string
  finalDueDays: string
  discountPct: string
  installments: boolean
  payInFull: boolean
  costs: CostRow[]
  accommodation: AccommodationRow[]
  perGuestCost: string
  revenuePct: string
  sales: SalesPreset
  salesManual: string
}

export const DEFAULT_FORM: Form = {
  title: '', currency: 'USD', price: '2800', guests: '18', nights: '6', monthsToStart: '5',
  depositMode: 'pct', deposit: '25', balanceDueDays: '45',
  model: 'full_campus', rate: '2000', capacity: '18', minGuests: '0', buyoutFee: '0',
  venueDepositPct: '25', finalDueDays: '45', discountPct: '5', installments: true, payInFull: false,
  costs: [], accommodation: [], perGuestCost: '0', revenuePct: '3', sales: 'even', salesManual: '',
}

export const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')))
export const cents = (s: string) => Math.round(num(s) * 100)

/** Кривая продаж: сколько гостей купит в каждый месяц (индекс 0 — месяц подписания). */
export function salesCurve(preset: SalesPreset, guests: number, months: number, manual: string): number[] {
  if (preset === 'manual') return manual.split(/[,;\s]+/).filter(Boolean).map((x) => Number(x))
  // потолки — до циклов: миллиард гостей из ссылки или формы не должен вешать вкладку
  if (!Number.isInteger(guests) || !Number.isInteger(months) || months < 1 || guests < 0
      || guests > LIMITS.guests || months > LIMITS.months) return []
  const curve = new Array(months).fill(0)
  if (preset === 'late' || preset === 'early') {
    const span = Math.min(2, months)
    const first = preset === 'late' ? months - span : 0
    for (let k = 0; k < guests; k++) curve[first + (k % span)] += 1
    return curve
  }
  for (let k = 0; k < guests; k++) curve[k % months] += 1
  return curve
}

export function toInputs(f: Form): Inputs {
  const guests = num(f.guests)
  const months = num(f.monthsToStart)
  return {
    currency: f.currency,
    pricePerGuest: cents(f.price),
    guests,
    nights: num(f.nights),
    monthsToStart: months,
    daysToStart: f.daysToStart,
    salesCurve: salesCurve(f.sales, guests, months, f.salesManual),
    guestDeposit: f.depositMode === 'pct' ? { kind: 'pct', value: num(f.deposit) } : { kind: 'amount', value: cents(f.deposit) },
    guestBalanceDueDays: num(f.balanceDueDays),
    venue: {
      model: f.model, ratePerGuest: cents(f.rate), capacity: num(f.capacity), minGuests: num(f.minGuests),
      buyoutFee: cents(f.buyoutFee), depositPct: num(f.venueDepositPct), finalDueDays: num(f.finalDueDays),
      payInFullDiscountPct: num(f.discountPct), installments: f.installments, payInFull: f.payInFull,
    },
    fixedCosts: f.costs.map((c) => ({ name: c.name, amount: cents(c.amount), monthsBeforeStart: num(c.monthsBeforeStart) })),
    accommodation: f.accommodation.filter((a) => a.name.trim() !== '').map((a) => ({
      name: a.name, guests: num(a.guests), surcharge: cents(a.surcharge), cost: cents(a.cost),
    })),
    perGuestCost: cents(f.perGuestCost),
    revenuePct: num(f.revenuePct),
  }
}

/** Форма после ссылки: поля, которых в ссылке нет, остаются из `prev`. */
export function applyLink(prev: Form, d: LinkData): Form {
  const v = d.venue ?? {}
  return {
    ...prev,
    title: d.title ?? prev.title,
    currency: d.currency ?? prev.currency,
    price: d.price !== undefined ? String(d.price) : prev.price,
    guests: d.guests !== undefined ? String(d.guests) : prev.guests,
    nights: d.nights !== undefined ? String(d.nights) : prev.nights,
    monthsToStart: d.monthsToStart !== undefined ? String(d.monthsToStart) : prev.monthsToStart,
    daysToStart: d.daysToStart,
    depositMode: d.guestDeposit !== undefined ? 'amount' : d.guestDepositPct !== undefined ? 'pct' : prev.depositMode,
    deposit: d.guestDeposit !== undefined ? String(d.guestDeposit) : d.guestDepositPct !== undefined ? String(d.guestDepositPct) : prev.deposit,
    balanceDueDays: d.guestBalanceDueDays !== undefined ? String(d.guestBalanceDueDays) : prev.balanceDueDays,
    model: v.model ?? prev.model,
    rate: v.ratePerGuest !== undefined ? String(v.ratePerGuest) : prev.rate,
    capacity: v.capacity !== undefined ? String(v.capacity) : prev.capacity,
    minGuests: v.minGuests !== undefined ? String(v.minGuests) : prev.minGuests,
    buyoutFee: v.buyoutFee !== undefined ? String(v.buyoutFee) : prev.buyoutFee,
    venueDepositPct: v.depositPct !== undefined ? String(v.depositPct) : prev.venueDepositPct,
    finalDueDays: v.finalDueDays !== undefined ? String(v.finalDueDays) : prev.finalDueDays,
    discountPct: v.payInFullDiscountPct !== undefined ? String(v.payInFullDiscountPct) : prev.discountPct,
    installments: v.installments ?? prev.installments,
    payInFull: v.payInFull ?? prev.payInFull,
    accommodation: d.accommodation
      ? d.accommodation.map((a) => ({ name: a.name, guests: String(a.guests), surcharge: String(a.surcharge), cost: String(a.cost) }))
      : prev.accommodation,
  }
}
