import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyLink, DEFAULT_FORM, toInputs } from '../retreat-calc/form'
import { decodeLink, encodeLink } from '../retreat-calc/link'
import { compute } from '../retreat-calc/engine'
import { decodeToolLink } from '../retreat-core/tool-link'
import {
  calcHashFromTimeline, defaultForm, draftOf, formFromDecoded, formFromDraft, pickTimelineTool,
  timelineHash, timelineHashFromCalcForm, type TimelineForm, withPassportId,
} from './form'
import { buildTimeline } from './engine'

const TODAY = '2026-10-17'
const fixture = JSON.parse(readFileSync(join(__dirname, '..', 'retreat-calc', 'fixtures', 'link-v1.json'), 'utf8'))

describe('форма таймлайна', () => {
  it('черновик не несёт данных гостей, даже если их подложить в форму', () => {
    const f = { ...defaultForm(TODAY), arrivals: [{ guest: 'Гость 1', phone: '+1 555' }] } as TimelineForm
    const draft = draftOf(f)
    expect(draft).not.toMatch(/Гость 1|555|arrivals|phone/)
    const restored = formFromDraft(draft, TODAY)
    expect(restored).toEqual(defaultForm(TODAY))
  })
  it('из ссылки калькулятора v1: подписание сегодня, старт через «месяцев до старта», условия площадки', () => {
    const f = formFromDecoded(decodeToolLink(encodeLink(fixture), pickTimelineTool, 'ru'), TODAY)
    expect(f?.terms.signDate).toBe(TODAY)
    expect(f?.passport).toMatchObject({ start: '2027-03-17', guests: 18, nights: 6, currency: 'USD', title: 'Example retreat' })
    expect(f?.terms.venue).toMatchObject({ model: 'full_campus', ratePerGuest: 200000, capacity: 18, depositPct: 25, finalDueDays: 45 })
    expect(f?.terms.venueNoReturnDays).toBe(45)
  })
  it('своя ссылка — круг без потерь', () => {
    const f = defaultForm(TODAY)
    expect(formFromDecoded(decodeToolLink(timelineHash(f), pickTimelineTool, 'ru'), TODAY)).toEqual(f)
  })
  it('битая ссылка — null', () => {
    expect(formFromDecoded(decodeToolLink('#data=@@', pickTimelineTool, 'ru'), TODAY)).toBeNull()
  })
  it('кнопка в калькуляторе ведёт в таймлайн своей ссылкой', () => {
    const d = decodeToolLink(timelineHashFromCalcForm(DEFAULT_FORM, TODAY), pickTimelineTool, 'en')
    expect(d.ok && d.kind).toBe('tool')
  })
  it('из таймлайна в калькулятор — ссылка v1, которую калькулятор понимает', () => {
    const d = decodeLink(calcHashFromTimeline(defaultForm(TODAY)), 'ru')
    expect(d.ok).toBe(true)
    if (d.ok) expect(d.data).toMatchObject({ guests: 18, nights: 6, monthsToStart: 5, venue: { ratePerGuest: 2000, finalDueDays: 45 } })
  })
  it('calcHashFromTimeline переносит payInFull и daysToStart, а платежи совпадают', () => {
    const timeline = defaultForm(TODAY)
    timeline.passport.start = '2027-02-16'
    timeline.terms.venue = { ...timeline.terms.venue, payInFull: true }
    const decoded = decodeLink(calcHashFromTimeline(timeline), 'ru')
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    const calc = applyLink(DEFAULT_FORM, decoded.data)
    const calcResult = compute({ ...toInputs(calc), daysToStart: decoded.data.daysToStart })
    const restored = formFromDecoded(decodeToolLink(calcHashFromTimeline(timeline), pickTimelineTool, 'ru'), TODAY)
    expect(restored?.passport.start).toBe(timeline.passport.start)
    expect(restored?.terms.venue.payInFull).toBe(true)
    const timelinePayment = buildTimeline(timeline.passport, timeline.terms, TODAY).milestones
      .filter((m) => m.amountCents !== null).map((m) => [m.date, m.amountCents])
    expect(calcResult.venueView.schedule.map((p) => [TODAY, p.amount])).toEqual(timelinePayment)
  })
  it('поздний договор без оплаты целиком: таймлайн и калькулятор по одной ссылке дают задаток и остаток', () => {
    const timeline = defaultForm(TODAY)
    // старт через 64 дня: остаток (за 45 дней) ещё впереди, но в калькуляторе это всё тот же месяц подписания
    timeline.passport.start = '2026-12-20'
    timeline.terms.venue = { ...timeline.terms.venue, payInFull: false, installments: false }
    const decoded = decodeLink(calcHashFromTimeline(timeline), 'ru')
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.data.daysToStart).toBe(64)
    const calc = applyLink(DEFAULT_FORM, decoded.data)
    const schedule = compute({ ...toInputs(calc), daysToStart: decoded.data.daysToStart }).venueView.schedule
    expect(schedule).toHaveLength(2)
    expect(schedule.every((p) => p.month === 0)).toBe(true)
    const venueSteps = buildTimeline(timeline.passport, timeline.terms, TODAY).milestones.filter((m) => m.id.startsWith('venue-'))
    expect(venueSteps.map((m) => m.id)).toEqual(['venue-deposit', 'venue-final'])
    expect(venueSteps.map((m) => m.amountCents)).toEqual(schedule.map((p) => p.amount))
    expect(venueSteps[0].date).toBe(TODAY)
    expect(venueSteps[1].date).toBe('2026-11-05')
  })

  it('withPassportId добавляет id только форме без id, defaultForm остаётся без id', () => {
    const form = defaultForm(TODAY)
    expect(form.passport.id).toBeUndefined()
    const added = withPassportId(form, () => 'retreat-test-1')
    expect(added.passport.id).toBe('retreat-test-1')
    const existing = withPassportId(added, () => 'retreat-other')
    expect(existing).toBe(added)
  })
})
