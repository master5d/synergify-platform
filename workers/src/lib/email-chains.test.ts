import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pickStep, templateName, TOCHKA_SBORKI, CHAIN_COURSES, type ChainInput, type ProgressRow } from './email-chains'
import { MODULE_ORDER } from './course-order'

const H = 3600
const D = 24 * H
const NOW = 2_000_000_000

function input(over: Partial<ChainInput> = {}): ChainInput {
  return {
    nowSec: NOW,
    locale: 'ru',
    course: TOCHKA_SBORKI,
    createdAt: NOW - 30 * D,
    emailOptout: false,
    lastEmailAt: null,
    telegramNudges: false,
    progress: [],
    moduleEvents: [],
    courseEventAt: null,
    sent: new Map(),
    ...over,
  }
}

const row = (slug: string, viewed: number, completed: number | null = null): ProgressRow =>
  ({ lesson_slug: slug, viewed_at: viewed, completed_at: completed })
const utcDay = (s: number) => new Date(s * 1000).toISOString().slice(0, 10)

describe('start chain (course not started)', () => {
  it('day 2 → start-1 with the first content unit of module 00', () => {
    const p = pickStep(input({ createdAt: NOW - 2 * D - H }))
    expect(p?.step).toBe('start-1')
    expect(p?.stepKey).toBe('start-1')
    expect(p?.data).toMatchObject({
      course_name: 'Точка Сборки',
      home_url: 'https://ai.synergify.com/',
      start_url: 'https://ai.synergify.com/lessons/00-kickstart/u1-map/',
    })
  })

  it('day 5 → start-2 with the Azbuka unit (en locale)', () => {
    const p = pickStep(input({ locale: 'en', createdAt: NOW - 5 * D - H, sent: new Map([['start-1', NOW - 3 * D]]) }))
    expect(p?.step).toBe('start-2')
    expect(p?.data).toMatchObject({
      course_name: 'Tochka Sborki',
      home_url: 'https://ai.synergify.com/en/',
      start_url: 'https://ai.synergify.com/en/lessons/00-kickstart/u0-azbuka/',
    })
  })

  it('day 1 → nothing; after start-2 was sent → nothing; long-dormant signups are not blasted', () => {
    expect(pickStep(input({ createdAt: NOW - D }))).toBeNull()
    expect(pickStep(input({ createdAt: NOW - 6 * D, sent: new Map([['start-2', NOW - D]]) }))).toBeNull()
    expect(pickStep(input({ createdAt: NOW - 60 * D }))).toBeNull()
  })

  it('any lesson opened → start chain stops', () => {
    expect(pickStep(input({ createdAt: NOW - 2 * D - H, progress: [row('00-kickstart/u0-azbuka', NOW - 2 * D)] }))).toBeNull()
  })

  it('start units exist in the ru and en pack', () => {
    const CONTENT = fileURLToPath(new URL('../../../LMS/tochka-sborki/web/packs/tochka-sborki/content/', import.meta.url))
    for (const lang of ['ru', 'en']) {
      for (const slug of [TOCHKA_SBORKI.startUnit, TOCHKA_SBORKI.azbukaUnit]) {
        const [mod, unit] = slug.split('/')
        const meta = JSON.parse(readFileSync(`${CONTENT}${lang}/${mod}/_meta.json`, 'utf8'))
        expect(meta.units.map((u: { slug: string }) => u.slug)).toContain(unit)
      }
    }
  })
})

describe('lapse chain (started, not finished)', () => {
  const last = NOW - 3 * D - H
  const started = [row('00-kickstart/u0-azbuka', NOW - 5 * D, NOW - 5 * D), row('01-introduction/u1-activation', last)]

  it('3 days idle → lapse-1 keyed by the day of last activity, resume at the open unit', () => {
    const p = pickStep(input({ progress: started, moduleEvents: [{ subject: '00-kickstart', created_at: NOW - 20 * D }] }))
    expect(p?.step).toBe('lapse-1')
    expect(p?.stepKey).toBe(`lapse-1@${utcDay(last)}`)
    expect(p?.data).toMatchObject({
      module_title: 'Знакомство',
      resume_url: 'https://ai.synergify.com/lessons/01-introduction/u1-activation/',
      done_modules: 1,
      total_modules: MODULE_ORDER.length,
    })
  })

  it('7 days → lapse-2 with support_url; 14 days → lapse-3; 21+ → silence', () => {
    const at = (idle: number) => pickStep(input({ progress: [row('02-setup-guide/u1-env-check', NOW - idle)] }))
    expect(at(7 * D + H)?.step).toBe('lapse-2')
    expect(at(7 * D + H)?.data).toMatchObject({ module_title: 'Базовый сетап', support_url: 'https://ai.synergify.com/support/' })
    expect(at(14 * D + H)?.step).toBe('lapse-3')
    expect(Object.keys(at(14 * D + H)!.data).sort()).toEqual(['course_name', 'home_url', 'resume_url'])
    expect(at(22 * D)).toBeNull()
    expect(at(2 * D)).toBeNull()
  })

  it('same episode is not repeated; a new episode after return repeats the step', () => {
    const key = `lapse-1@${utcDay(last)}`
    expect(pickStep(input({ progress: started, sent: new Map([[key, NOW - H * 21]]) }))).toBeNull()
    // Первый эпизод: пропал 20 дней назад, lapse-1 ушёл. Вернулся и снова пропал — новый день активности = новый эпизод.
    const first = NOW - 20 * D
    const oldKey = `lapse-1@${utcDay(first)}`
    const p = pickStep(input({ progress: [row('00-kickstart/u0-azbuka', first), ...started], sent: new Map([[oldKey, first + 3 * D]]) }))
    expect(p?.stepKey).toBe(key)
    expect(key).not.toBe(oldKey)
  })

  it('resume falls back to the next spine module page when nothing is open', () => {
    const p = pickStep(input({ progress: [row('00-kickstart', NOW - 4 * D, NOW - 4 * D)] }))
    expect(p?.data.resume_url).toBe('https://ai.synergify.com/lessons/01-introduction/')
    expect(p?.data.done_modules).toBe(1)
  })

  it('finished course → no lapse', () => {
    expect(pickStep(input({ progress: started, courseEventAt: NOW - 30 * D, sent: new Map([['finish-1', NOW - 30 * D], ['finish-2', NOW - 23 * D]]) }))).toBeNull()
  })
})

describe('reminder gates', () => {
  const lapsing = { progress: [row('01-introduction/u1-activation', NOW - 3 * D - H)] }

  it('20h quiet after activity blocks reminders', () => {
    expect(pickStep(input({ createdAt: NOW - 2 * D - H, progress: [] }))?.step).toBe('start-1')
    expect(pickStep(input({ progress: [row('01-introduction/u1-activation', NOW - 10 * H)] }))).toBeNull()
  })

  it('Telegram channel with nudges on → no email reminders', () => {
    expect(pickStep(input({ ...lapsing, telegramNudges: true }))).toBeNull()
    expect(pickStep(input({ createdAt: NOW - 2 * D - H, telegramNudges: true }))).toBeNull()
  })

  it('quiet + Telegram do not block milestone/finish', () => {
    const p = pickStep(input({
      telegramNudges: true,
      progress: [row('03-stack-selection/u9', NOW - H, NOW - H)],
      moduleEvents: [{ subject: '03-stack-selection', created_at: NOW - H }],
    }))
    expect(p?.step).toBe('milestone')
  })
})

describe('global gates', () => {
  it('email_optout → nothing, even finish', () => {
    expect(pickStep(input({ emailOptout: true, courseEventAt: NOW - H }))).toBeNull()
  })

  it('one email per 20h via last_email_at', () => {
    expect(pickStep(input({ lastEmailAt: NOW - 19 * H, courseEventAt: NOW - H }))).toBeNull()
    expect(pickStep(input({ lastEmailAt: NOW - 21 * H, courseEventAt: NOW - H }))?.step).toBe('finish-1')
  })
})

describe('milestone', () => {
  it('uses module title, next module, counts and the transformation', () => {
    const p = pickStep(input({
      locale: 'en',
      moduleEvents: [{ subject: '00-kickstart', created_at: NOW - 10 * D }, { subject: '01-introduction', created_at: NOW - H }],
      sent: new Map([['milestone@00-kickstart', NOW - 10 * D]]),
    }))
    expect(p?.stepKey).toBe('milestone@01-introduction')
    expect(p?.data).toMatchObject({
      module_title: 'Introduction',
      next_title: 'Setup',
      next_url: 'https://ai.synergify.com/en/lessons/02-setup-guide/',
      done_modules: 2,
      total_modules: MODULE_ORDER.length,
      from: '"AI is about code"',
      to: 'I grasp the four shifts of Software 3.0',
    })
    expect(p?.alsoMark).toEqual([])
  })

  it('collapses several unsent events into the freshest one, marking the rest', () => {
    const p = pickStep(input({
      moduleEvents: [
        { subject: '02-setup-guide', created_at: NOW - 2 * D },
        { subject: '04-prompt-engineering', created_at: NOW - H },
        { subject: '03-stack-selection', created_at: NOW - D },
      ],
    }))
    expect(p?.stepKey).toBe('milestone@04-prompt-engineering')
    expect(p?.alsoMark.sort()).toEqual(['milestone@02-setup-guide', 'milestone@03-stack-selection'])
  })

  it('last spine module → empty next_title/next_url; next skips already-done modules', () => {
    const last = MODULE_ORDER[MODULE_ORDER.length - 1]
    expect(pickStep(input({ moduleEvents: [{ subject: last, created_at: NOW - H }] }))?.data)
      .toMatchObject({ next_title: '', next_url: '' })
    const p = pickStep(input({
      moduleEvents: [{ subject: '02-setup-guide', created_at: NOW - 5 * D }, { subject: '01-introduction', created_at: NOW - H }],
      sent: new Map([['milestone@02-setup-guide', NOW - 5 * D]]),
    }))
    expect(p?.data.next_url).toBe('https://ai.synergify.com/lessons/03-stack-selection/')
  })

  it('stale events (older than the window) are not sent', () => {
    expect(pickStep(input({ moduleEvents: [{ subject: '01-introduction', created_at: NOW - 8 * D }] }))).toBeNull()
  })
})

describe('finish', () => {
  it('finish-1 beats milestone and swallows pending milestones', () => {
    const p = pickStep(input({
      moduleEvents: [{ subject: '08-agent-engineering', created_at: NOW - H }],
      courseEventAt: NOW - H,
    }))
    expect(p?.step).toBe('finish-1')
    expect(p?.data.certificate_url).toBe('https://ai.synergify.com/certificate/')
    expect(p?.alsoMark).toEqual(['milestone@08-agent-engineering'])
  })

  it('finish-2 comes 7 days after finish-1 with advanced/notebook/support urls', () => {
    const sent = new Map([['finish-1', NOW - 7 * D - H]])
    const p = pickStep(input({ locale: 'en', courseEventAt: NOW - 8 * D, sent }))
    expect(p?.step).toBe('finish-2')
    expect(p?.data).toMatchObject({
      advanced_url: 'https://ai.synergify.com/en/lessons/10-model-training/',
      notebook_url: 'https://ai.synergify.com/en/lessons/09-ai-notebook/',
      support_url: 'https://ai.synergify.com/en/support/',
    })
    expect(pickStep(input({ courseEventAt: NOW - 8 * D, sent: new Map([['finish-1', NOW - 3 * D]]) }))).toBeNull()
  })

  it('priority: finish > milestone > lapse > start', () => {
    const everything = input({
      createdAt: NOW - 2 * D - H,
      progress: [row('01-introduction/u1-activation', NOW - 3 * D - H)],
      moduleEvents: [{ subject: '00-kickstart', created_at: NOW - D }],
    })
    expect(pickStep(everything)?.step).toBe('milestone')
    expect(pickStep({ ...everything, moduleEvents: [] })?.step).toBe('lapse-1')
    expect(pickStep({ ...everything, courseEventAt: NOW - D })?.step).toBe('finish-1')
  })
})

describe('templateName', () => {
  it('ts-<step>-<lang>; one course configured', () => {
    expect(templateName(TOCHKA_SBORKI, 'milestone', 'en')).toBe('ts-milestone-en')
    expect(templateName(TOCHKA_SBORKI, 'start-1', 'ru')).toBe('ts-start-1-ru')
    expect(CHAIN_COURSES.map(c => c.key)).toEqual(['tochka-sborki'])
  })
})
