import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CHAIN_COURSES, TOCHKA_SBORKI, pickStep, templateName, type ChainInput, type Step } from './email-chains'

// Шаблоны писем (workers/email-templates/) ↔ политика (lib/email-chains.ts): каждый шаг, который
// политика умеет выбрать, имеет шаблон на каждом языке, и шаблон не читает поле, которого политика
// не кладёт в .Tx.Data (Listmonk отрендерит пустоту молча — «<no value>» в теме письма).
const DIR = fileURLToPath(new URL('../../email-templates/', import.meta.url))
const read = (f: string) => readFileSync(DIR + f, 'utf-8')
const fields = (s: string) => new Set([...s.matchAll(/\.Tx\.Data\.([a-z_]+)/g)].map(m => m[1]))

const N = 1_790_000_000
const DAY = 86_400
const base = (over: Partial<ChainInput>): ChainInput => ({
  nowSec: N, locale: 'ru', course: TOCHKA_SBORKI, createdAt: N - 40 * DAY, emailOptout: false,
  lastEmailAt: null, telegramNudges: false, progress: [], moduleEvents: [], courseEventAt: null,
  sent: new Map(), ...over,
})
const open = (daysAgo: number) => [{ lesson_slug: '01-introduction/u2-four-shifts', viewed_at: N - daysAgo * DAY, completed_at: null }]

const SCENARIOS: Record<Step, Partial<ChainInput>> = {
  'start-1': { createdAt: N - 3 * DAY },
  'start-2': { createdAt: N - 6 * DAY },
  'lapse-1': { progress: open(4) },
  'lapse-2': { progress: open(8) },
  'lapse-3': { progress: open(15) },
  milestone: { progress: open(1), moduleEvents: [{ subject: '01-introduction', created_at: N - DAY }] },
  'finish-1': { progress: open(1), courseEventAt: N - DAY },
  'finish-2': { progress: open(9), courseEventAt: N - 10 * DAY, sent: new Map([['finish-1', N - 8 * DAY]]) },
}

describe('email templates ↔ chain policy', () => {
  it('every template file is a known step × language, and nothing is missing', () => {
    const expected = CHAIN_COURSES.flatMap(c =>
      (Object.keys(SCENARIOS) as Step[]).flatMap(s => (['ru', 'en'] as const).map(l => `${templateName(c, s, l)}.html`)))
    const actual = readdirSync(DIR).filter(f => /^[a-z]+-.+\.html$/.test(f) && !f.startsWith('_'))
    expect(actual.sort()).toEqual(expected.sort())
  })

  for (const [step, over] of Object.entries(SCENARIOS) as [Step, Partial<ChainInput>][]) {
    for (const locale of ['ru', 'en'] as const) {
      it(`${step}/${locale}: the policy picks it and supplies every field the template reads`, () => {
        const pick = pickStep(base({ ...over, locale }))
        expect(pick?.step).toBe(step)
        const supplied = new Set([...Object.keys(pick!.data), 'unsubscribe_url'])   // unsubscribe_url добавляет cron
        const name = templateName(TOCHKA_SBORKI, step, locale)
        const body = read(`${name}.html`)
        expect(body.startsWith('<!-- subject: ')).toBe(true)
        const used = new Set([...fields(body), ...fields(read(`_layout-${locale}.html`))])
        expect([...used].filter(f => !supplied.has(f))).toEqual([])
      })
    }
  }

  it('layouts keep one body marker and the unsubscribe link', () => {
    for (const l of ['ru', 'en']) {
      const lay = read(`_layout-${l}.html`)
      expect(lay.split('<!-- BODY -->').length).toBe(2)
      expect(lay).toContain('{{ .Tx.Data.unsubscribe_url }}')
    }
  })
})
