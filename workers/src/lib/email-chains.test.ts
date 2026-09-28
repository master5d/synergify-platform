import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { pickStep, templateName, TOCHKA_SBORKI, CHAIN_COURSES, type ChainInput, type ProgressRow } from './email-chains'
import { MODULE_ORDER, MODULE_META, type ModuleRevision } from './course-order'

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

  it('finish-2 comes 7 days after finish-1 with the academy invite and support url', () => {
    const sent = new Map([['finish-1', NOW - 7 * D - H]])
    const p = pickStep(input({ locale: 'en', courseEventAt: NOW - 8 * D, sent }))
    expect(p?.step).toBe('finish-2')
    expect(p?.data).toMatchObject({
      academy_url: 'https://academy.synergify.com/en/',
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

describe('update (skill refresh for those who closed a revised module)', () => {
  const rev = (daysAgo: number, version = 2, summary = { ru: 'Новая практика с агентом.', en: 'A new agent practice.' }): ModuleRevision =>
    ({ version, date: utcDay(NOW - daysAgo * D), summary })
  const revAt = (daysAgo: number) => Date.parse(`${utcDay(NOW - daysAgo * D)}T00:00:00Z`) / 1000
  const course = (revisions: Record<string, ModuleRevision>) => ({ ...TOCHKA_SBORKI, revisions })
  const closed = (mod: string, at: number) => ({ subject: mod, created_at: at })

  it('the real course carries exactly the revisions from MODULE_META', () => {
    const expected = Object.fromEntries(Object.entries(MODULE_META).filter(([, m]) => m.revision).map(([k, m]) => [k, m.revision]))
    expect(TOCHKA_SBORKI.revisions).toEqual(expected)
  })

  it('module closed before the revision day → update with title, summary and module url', () => {
    const p = pickStep(input({
      locale: 'en',
      course: course({ '04-prompt-engineering': rev(2) }),
      moduleEvents: [closed('04-prompt-engineering', NOW - 40 * D)],
    }))
    expect(p?.step).toBe('update')
    expect(p?.stepKey).toBe('update@04-prompt-engineering@v2')
    expect(p?.data).toMatchObject({
      module_title: 'Prompt Engineering',
      summary: 'A new agent practice.',
      module_url: 'https://ai.synergify.com/en/lessons/04-prompt-engineering/',
    })
    expect(p?.alsoMark).toEqual([])
  })

  it('version 1 (no field or version < 2) → nothing', () => {
    const ev = [closed('04-prompt-engineering', NOW - 40 * D)]
    expect(pickStep(input({ course: course({}), moduleEvents: ev }))).toBeNull()
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(2, 1) }), moduleEvents: ev }))).toBeNull()
  })

  it('closed on/after the revision day → nothing; closed the day before → yes', () => {
    const c = course({ '04-prompt-engineering': rev(3) })
    const sent = new Map([['milestone@04-prompt-engineering', NOW - 3 * D]])   // milestone своё уже отработал
    expect(pickStep(input({ course: c, sent, moduleEvents: [closed('04-prompt-engineering', revAt(3) + H)] }))).toBeNull()
    expect(pickStep(input({ course: c, sent, moduleEvents: [closed('04-prompt-engineering', revAt(3))] }))).toBeNull()
    expect(pickStep(input({ course: c, sent, moduleEvents: [closed('04-prompt-engineering', revAt(3) - H)] }))?.step).toBe('update')
  })

  it('module never closed → nothing (a non-graduate who has not reached it)', () => {
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(2) }), moduleEvents: [closed('03-stack-selection', NOW - 40 * D)] }))).toBeNull()
  })

  it('outside the 14-day window (and a future date) → nothing', () => {
    const ev = [closed('04-prompt-engineering', NOW - 60 * D)]
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(15) }), moduleEvents: ev }))).toBeNull()
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(-2) }), moduleEvents: ev }))).toBeNull()
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(13) }), moduleEvents: ev }))?.step).toBe('update')
  })

  it('same version already sent → nothing; a new version → sent again', () => {
    const ev = [closed('04-prompt-engineering', NOW - 90 * D)]
    const sent = new Map([['update@04-prompt-engineering@v2', NOW - 30 * D]])
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(2) }), moduleEvents: ev, sent }))).toBeNull()
    expect(pickStep(input({ course: course({ '04-prompt-engineering': rev(2, 3) }), moduleEvents: ev, sent }))?.stepKey)
      .toBe('update@04-prompt-engineering@v3')
  })

  it('graduate: spine modules count as closed at graduation; off-spine ones need their own event', () => {
    const grad = { courseEventAt: NOW - 50 * D, sent: new Map([['finish-1', NOW - 50 * D], ['finish-2', NOW - 43 * D]]) }
    expect(pickStep(input({ ...grad, course: course({ '05-context-memory': rev(1) }) }))?.stepKey).toBe('update@05-context-memory@v2')
    expect(pickStep(input({ ...grad, course: course({ '10-model-training': rev(1) }) }))).toBeNull()
    expect(pickStep(input({ ...grad, course: course({ '10-model-training': rev(1) }), moduleEvents: [closed('10-model-training', NOW - 20 * D)] }))?.step)
      .toBe('update')
  })

  it('legacy whole-module progress row counts as closing', () => {
    const p = pickStep(input({
      course: course({ '02-setup-guide': rev(1) }),
      progress: [row('02-setup-guide', NOW - 100 * D, NOW - 100 * D)],
    }))
    expect(p?.stepKey).toBe('update@02-setup-guide@v2')
  })

  it('several revised modules → one letter about the freshest, the rest marked', () => {
    const p = pickStep(input({
      course: course({ '02-setup-guide': rev(5), '04-prompt-engineering': rev(1), '03-stack-selection': rev(3) }),
      moduleEvents: ['02-setup-guide', '03-stack-selection', '04-prompt-engineering'].map(m => closed(m, NOW - 40 * D)),
    }))
    expect(p?.stepKey).toBe('update@04-prompt-engineering@v2')
    expect(p?.alsoMark.sort()).toEqual(['update@02-setup-guide@v2', 'update@03-stack-selection@v2'])
  })

  it('priority: finish-1 / finish-2 > milestone > update > lapse', () => {
    const c = course({ '00-kickstart': rev(2) })
    const base = { course: c, moduleEvents: [closed('00-kickstart', NOW - 40 * D)] }
    expect(pickStep(input({ ...base, courseEventAt: NOW - D }))?.step).toBe('finish-1')
    expect(pickStep(input({ ...base, courseEventAt: NOW - 8 * D, sent: new Map([['finish-1', NOW - 7 * D - H]]) }))?.step).toBe('finish-2')
    const fresh = pickStep(input({ ...base, moduleEvents: [...base.moduleEvents, closed('01-introduction', NOW - H)] }))
    expect(fresh?.step).toBe('milestone')
    expect(fresh?.alsoMark.filter(k => k.startsWith('update@'))).toEqual([])   // update не поглощается — придёт следующим днём
    expect(pickStep(input({ ...base, progress: [row('01-introduction/u1-activation', NOW - 3 * D - H)] }))?.step).toBe('update')
  })

  it('not a reminder: Telegram channel and 20h quiet do not block it; opt-out and 20h throttle do', () => {
    const base = { course: course({ '00-kickstart': rev(2) }), moduleEvents: [closed('00-kickstart', NOW - 40 * D)] }
    expect(pickStep(input({ ...base, telegramNudges: true, progress: [row('01-introduction/u1-activation', NOW - H)] }))?.step).toBe('update')
    expect(pickStep(input({ ...base, emailOptout: true }))).toBeNull()
    expect(pickStep(input({ ...base, lastEmailAt: NOW - 19 * H }))).toBeNull()
    expect(pickStep(input({ ...base, lastEmailAt: NOW - 21 * H }))?.step).toBe('update')
  })
})

describe('templateName', () => {
  it('ts-<step>-<lang>; one course configured', () => {
    expect(templateName(TOCHKA_SBORKI, 'milestone', 'en')).toBe('ts-milestone-en')
    expect(templateName(TOCHKA_SBORKI, 'start-1', 'ru')).toBe('ts-start-1-ru')
    expect(CHAIN_COURSES.map(c => c.key)).toEqual(['tochka-sborki'])
  })
})
