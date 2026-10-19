import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Venue } from '../retreat-calc/engine'
import { parseCsv } from '../retreat-core/csv'
import { buildTimeline, MILESTONE_ORDER, type WarningId } from './engine'
import { milestonesToCsv, milestonesToIcs } from './export'
import { milestoneLabel, warningText } from './labels'

const VENUE: Venue = {
  model: 'full_campus', ratePerGuest: 180000, capacity: 20, minGuests: 0, buyoutFee: 0,
  depositPct: 25, finalDueDays: 60, payInFullDiscountPct: 5, installments: true, payInFull: false,
}
const R = buildTimeline(
  { start: '2027-05-10', nights: 6, guests: 20, currency: 'USD' },
  { signDate: '2026-11-10', venue: VENUE, guestDepositPct: 30, guestBalanceDueDays: 45, guestRefundDays: 45, venueNoReturnDays: 60 },
  '2026-10-17',
)
const template = (name: string) =>
  readFileSync(join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials', name), 'utf8')

describe('CSV вех', () => {
  it('BOM и заголовок — как у шаблона курса, на обоих языках', () => {
    for (const lang of ['ru', 'en'] as const) {
      const csv = milestonesToCsv(R.milestones, lang)
      expect(csv.startsWith('\uFEFF')).toBe(true)
      expect(csv.split('\r\n')[0]).toBe(template(`timeline.${lang}.csv`).split(/\r?\n/)[0])
    }
  })
  it('суммы — в единицах валюты, строки разбираются обратно', () => {
    const rows = parseCsv(milestonesToCsv(R.milestones, 'ru'))
    const deposit = rows.find((r) => r[3] === 'Первый платёж площадке')
    expect(deposit?.slice(0, 2)).toEqual(['181', '2026-11-10'])
    expect(deposit?.[4]).toBe('9000')
    expect(rows).toHaveLength(R.milestones.length + 1)
  })
  it('CSV пишет подпись статуса в колонку «Статус»', () => {
    const statusRows = parseCsv(milestonesToCsv(buildTimeline(
      { start: '2027-05-10', nights: 6, guests: 20, currency: 'USD' },
      { signDate: '2026-11-10', venue: VENUE, guestDepositPct: 30, guestBalanceDueDays: 45, guestRefundDays: 45, venueNoReturnDays: 60 },
      '2026-11-01',
    ).milestones, 'ru'))
    const sign = statusRows.find((r) => r[3] === 'Подписан договор с площадкой')
    expect(sign?.[5]).toBe('скоро')
  })
})

describe('календарь', () => {
  const ics = milestonesToIcs(R.milestones, 'Ретрит, май', 'ru')
  it('по событию на веху, даты на весь день, CRLF', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(R.milestones.length)
    expect(ics).toContain('DTSTART;VALUE=DATE:20270510')
    expect(ics.split('\n').every((l) => l === '' || l.endsWith('\r'))).toBe(true)
  })
  it('строки не длиннее 75 октетов, запятая экранирована', () => {
    const enc = new TextEncoder()
    expect(ics.split('\r\n').every((l) => enc.encode(l).length <= 75)).toBe(true)
    expect(ics.replace(/\r\n /g, '')).toContain('SUMMARY:Ретрит\\, май: Заезд')
  })
})

describe('тексты', () => {
  const WARNINGS: WarningId[] = ['guest-refund-after-venue-no-return', 'resale-buffer-short', 'sign-after-venue-final', 'milestone-in-past']
  it('у каждой вехи и предупреждения есть текст на обоих языках, фразы ≤ 25 слов', () => {
    for (const lang of ['ru', 'en'] as const) {
      const texts = [
        ...MILESTONE_ORDER.map((id) => milestoneLabel({ id, n: 1 }, lang)),
        ...WARNINGS.map((id) => warningText({ id, days: 10, milestone: 'go-no-go' }, lang)),
      ]
      for (const t of texts) {
        expect(t.trim().length).toBeGreaterThan(0)
        for (const sentence of t.split(/[.!?:]\s/)) expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(25)
      }
    }
  })
})

describe('календарь — момент выгрузки', () => {
  it('DTSTAMP берётся из переданного момента', () => {
    expect(milestonesToIcs(R.milestones, '', 'en', '20261017T120000Z')).toContain('DTSTAMP:20261017T120000Z')
  })
})

describe('календарь — UID событий', () => {
  const uids = (ics: string) => ics.replace(/\r\n /g, '').match(/^UID:.*$/gm) ?? []
  it('UID не зависит от даты вехи и различает ретриты по названию', () => {
    const a = uids(milestonesToIcs(R.milestones, 'Май', 'ru'))
    const shifted = R.milestones.map((m) => (m.id === 'venue-final' ? { ...m, date: '2027-03-01' } : m))
    expect(uids(milestonesToIcs(shifted, 'Май', 'ru'))).toEqual(a)
    expect(uids(milestonesToIcs(R.milestones, 'Июнь', 'ru'))).not.toEqual(a)
    expect(new Set(a).size).toBe(a.length)
  })
  it('с паспортным id UID не меняется при смене названия и даты старта', () => {
    const a = uids(milestonesToIcs(R.milestones, 'Май', 'ru', undefined, 'retreat-1234'))
    const shifted = R.milestones.map((m) => ({ ...m, date: m.date === '2027-05-10' ? '2027-06-10' : m.date }))
    expect(uids(milestonesToIcs(shifted, 'Июнь', 'ru', undefined, 'retreat-1234'))).toEqual(a)
  })
})
