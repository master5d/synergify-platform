import { describe, expect, it } from 'vitest'
import type { Venue } from '../retreat-calc/engine'
import type { RetreatPassport } from '../retreat-core/passport'
import { buildTimeline, validateTimeline, type TimelineTerms } from './engine'

const usd = (n: number) => n * 100

// учебный план курса (обезличенный): кампус на 20 мест по $1 800, старт 10 мая 2027
const PASSPORT: RetreatPassport = { start: '2027-05-10', nights: 6, guests: 20, currency: 'USD' }
const VENUE: Venue = {
  model: 'full_campus', ratePerGuest: usd(1800), capacity: 20, minGuests: 0, buyoutFee: 0,
  depositPct: 25, finalDueDays: 60, payInFullDiscountPct: 5, installments: true, payInFull: false,
}
const TERMS: TimelineTerms = {
  signDate: '2026-11-10', venue: VENUE, guestDepositPct: 30,
  guestBalanceDueDays: 45, guestRefundDays: 45, venueNoReturnDays: 60,
}

const at = (r: ReturnType<typeof buildTimeline>, id: string, n?: number) =>
  r.milestones.find((m) => m.id === id && (n === undefined || m.n === n))

describe('учебный план', () => {
  const r = buildTimeline(PASSPORT, TERMS, '2026-10-17')
  it('платежи площадке по датам', () => {
    expect(at(r, 'venue-deposit')).toMatchObject({ date: '2026-11-10', amountCents: 900000 })
    expect([1, 2, 3].map((n) => [at(r, 'venue-installment', n)?.date, at(r, 'venue-installment', n)?.amountCents]))
      .toEqual([['2026-12-10', 675000], ['2027-01-10', 675000], ['2027-02-10', 675000]])
    expect(at(r, 'venue-final')).toMatchObject({ date: '2027-03-11', amountCents: 675000, daysBefore: 60 })
    const total = r.milestones.reduce((s, m) => s + (m.amountCents ?? 0), 0)
    expect(total).toBe(3600000)
  })
  it('сроки гостей, курса и паспорта', () => {
    const dates = Object.fromEntries(r.milestones.filter((m) => m.n === undefined).map((m) => [m.id, m.date]))
    expect(dates).toMatchObject({
      'go-no-go': '2027-03-11', 'guest-balance': '2027-03-26', 'guest-refund-deadline': '2027-03-26',
      'form-send': '2027-03-26', 'form-answers': '2027-04-10', 'menu-to-chef': '2027-04-19',
      'arrivals-final': '2027-05-03', 'arrival': '2027-05-10', 'departure': '2027-05-16',
    })
    expect(at(r, 'departure')?.daysBefore).toBe(-6)
  })
  it('вехи по порядку дат', () => {
    const ds = r.milestones.map((m) => m.date)
    expect([...ds].sort()).toEqual(ds)
  })
  it('гость отменяет с возвратом позже точки невозврата площадки — предупреждение', () => {
    expect(r.warnings).toEqual([{ id: 'guest-refund-after-venue-no-return' }])
  })
})

describe('исправленный план', () => {
  it('зазор 15 дней — тихо, 10 дней — мало на перепродажу', () => {
    expect(buildTimeline(PASSPORT, { ...TERMS, guestRefundDays: 75 }, '2026-10-17').warnings).toEqual([])
    expect(buildTimeline(PASSPORT, { ...TERMS, guestRefundDays: 70 }, '2026-10-17').warnings)
      .toEqual([{ id: 'resale-buffer-short', days: 10 }])
  })
})

describe('короткий срок', () => {
  it('подписание после финального срока — один платёж в день подписания', () => {
    const r = buildTimeline(PASSPORT, { ...TERMS, signDate: '2027-04-01', guestRefundDays: 75 }, '2026-10-17')
    const pays = r.milestones.filter((m) => m.amountCents !== null)
    expect(pays).toHaveLength(1)
    expect(pays[0]).toMatchObject({ date: '2027-04-01', amountCents: 3600000 })
    expect(r.warnings).toEqual([{ id: 'sign-after-venue-final' }])
  })
})

describe('вехи в прошлом', () => {
  it('прошедшие отмечены, подписание — нет', () => {
    const r = buildTimeline(PASSPORT, { ...TERMS, guestRefundDays: 75 }, '2027-03-20')
    const past = r.warnings.filter((w) => w.id === 'milestone-in-past').map((w) => w.milestone)
    expect(past).toContain('venue-final')
    expect(past).toContain('go-no-go')
    expect(past).not.toContain('sign')
    expect(past).not.toContain('venue-deposit')
    expect(past).not.toContain('sales-open')
    expect(past).not.toContain('guest-balance')
  })
})

describe('депозит 0 %', () => {
  it('нулевого платежа в вехах нет, сумма контракта та же', () => {
    const r = buildTimeline(PASSPORT, { ...TERMS, venue: { ...VENUE, depositPct: 0 } }, '2026-10-17')
    const pays = r.milestones.filter((m) => m.amountCents !== null)
    expect(pays.some((m) => m.amountCents === 0)).toBe(false)
    expect(pays.reduce((s, m) => s + (m.amountCents ?? 0), 0)).toBe(3600000)
  })
})

describe('валидация', () => {
  it('нет даты старта, подписание позже старта', () => {
    expect(validateTimeline({ ...PASSPORT, start: undefined }, TERMS, 'ru').some((e) => e.startsWith('start'))).toBe(true)
    expect(validateTimeline(PASSPORT, { ...TERMS, signDate: '2027-06-01' }, 'ru').some((e) => e.startsWith('signDate'))).toBe(true)
    expect(validateTimeline(PASSPORT, { ...TERMS, guestRefundDays: -1 }, 'en').some((e) => e.startsWith('guestRefundDays'))).toBe(true)
  })
  it('невалидный вход — исключение, а не NaN', () => {
    expect(() => buildTimeline({ ...PASSPORT, nights: 0 }, TERMS, '2026-10-17')).toThrow(/nights/)
  })
})
