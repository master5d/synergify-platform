import { describe, it, expect } from 'vitest'
import {
  buildEvidence, interpretVerify, readVerifyCode, verifiedTransformations, verifyPageUrl, SPINE_TOTAL,
  type ProgressRow,
} from './certificate-evidence'
import { MODULE_SLUGS } from './rpg/modules'
import { MICRO_TRANSFORMATIONS } from './rpg/transformations'
import { getNavigationItems } from './content'
import { outlineFromNav } from './progress-sync'
import {
  EVIDENCE_FONT, EVIDENCE_GAP, EVIDENCE_MAX_ROWS, EVIDENCE_ROW0, EVIDENCE_STEP, VERIFY_FONT,
} from '@/components/certificate-svg'

const OUTLINE = outlineFromNav(getNavigationItems('ru'))
const unitRows = (mod: string, at = 100): ProgressRow[] =>
  OUTLINE[mod].map((u, i) => ({ lesson_slug: `${mod}/${u}`, completed_at: at + i, course: 'tochka-sborki' }))

describe('buildEvidence', () => {
  it('no progress → no evidence (nothing is invented)', () => {
    expect(buildEvidence([], OUTLINE, 'ru')).toEqual([])
  })

  it('a module counts when all its units are completed on the platform', () => {
    const ev = buildEvidence(unitRows('02-setup-guide'), OUTLINE, 'ru', 'tochka-sborki')
    expect(ev).toHaveLength(1)
    expect(ev[0]).toMatchObject({
      slug: '02-setup-guide',
      from: MICRO_TRANSFORMATIONS['02-setup-guide'].from.ru,
      to: MICRO_TRANSFORMATIONS['02-setup-guide'].to.ru,
      units: { done: OUTLINE['02-setup-guide'].length, total: OUTLINE['02-setup-guide'].length },
      completedAt: 100 + OUTLINE['02-setup-guide'].length - 1,
    })
  })

  it('a partially completed module, viewed-only rows and another course do not count', () => {
    const partial = unitRows('04-prompt-engineering').slice(1)
    const viewed: ProgressRow = { lesson_slug: '00-kickstart', completed_at: null }
    const foreign: ProgressRow = { lesson_slug: '01-introduction', completed_at: 5, course: 'living-practice' }
    expect(buildEvidence([...partial, viewed, foreign], OUTLINE, 'ru', 'tochka-sborki')).toEqual([])
  })

  it('a module-level row counts even without unit rows (legacy/LessonLayout)', () => {
    const ev = buildEvidence([{ lesson_slug: '00-kickstart', completed_at: 7 }], OUTLINE, 'en')
    expect(ev.map(e => e.slug)).toEqual(['00-kickstart'])
    expect(ev[0].units.done).toBe(0)
    expect(ev[0].to).toBe(MICRO_TRANSFORMATIONS['00-kickstart'].to.en)
  })

  it('keeps spine order and ignores optional modules', () => {
    const rows = [...unitRows('09-ai-notebook'), ...unitRows('05-context-memory'), { lesson_slug: '01-introduction', completed_at: 1 }]
    expect(buildEvidence(rows, OUTLINE, 'ru').map(e => e.slug)).toEqual(['01-introduction', '05-context-memory'])
  })

  it('the full spine yields SPINE_TOTAL lines', () => {
    const rows = MODULE_SLUGS.flatMap(m => unitRows(m))
    expect(buildEvidence(rows, OUTLINE, 'ru')).toHaveLength(SPINE_TOTAL)
    expect(SPINE_TOTAL).toBe(9)
  })
})

describe('certificate SVG stays readable', () => {
  // Моноширинный кегль ≈ 0.6em на знак (+ запас 10%). «от» вправо от стрелки, «к» влево —
  // каждой половине доступно (W/2 − GAP − поле 70).
  const HALF = 800 / 2 - EVIDENCE_GAP - 70
  const width = (s: string, font: number) => [...s].length * font * 0.6 * 1.1

  it.each(['ru', 'en'] as const)('%s: every spine transformation fits its half of the ticket', (locale) => {
    for (const slug of MODULE_SLUGS) {
      const t = MICRO_TRANSFORMATIONS[slug]
      expect(width(t.from[locale], EVIDENCE_FONT), `${slug} from`).toBeLessThanOrEqual(HALF)
      expect(width(t.to[locale], EVIDENCE_FONT), `${slug} to`).toBeLessThanOrEqual(HALF)
    }
  })

  it('all nine rows fit above the seal', () => {
    expect(EVIDENCE_MAX_ROWS).toBeGreaterThanOrEqual(SPINE_TOTAL)
    expect(EVIDENCE_ROW0 + (EVIDENCE_MAX_ROWS - 1) * EVIDENCE_STEP).toBeLessThan(718 - 20)
  })

  it('the verify URL line fits inside the frame', () => {
    const code = `${'3f2b8a1e-1111-4c2d-9e0f-123456789abc'}.${'A'.repeat(43)}`
    const line = `проверка · ${verifyPageUrl('https://ai.synergify.com', 'en', code).replace(/^https?:\/\//, '')}`
    expect([...line].length * (VERIFY_FONT * 0.6)).toBeLessThanOrEqual(800 - 2 * 70)
  })
})

describe('verify page logic', () => {
  it('builds the same URL shape as the worker, per locale and base path', () => {
    expect(verifyPageUrl('https://ai.synergify.com/', 'ru', 'u.s')).toBe('https://ai.synergify.com/certificate/verify/?c=u.s')
    expect(verifyPageUrl('https://ai.synergify.com', 'en', 'u.s')).toBe('https://ai.synergify.com/en/certificate/verify/?c=u.s')
    expect(verifyPageUrl('https://x.org', 'ru', 'u.s', '/praktika')).toBe('https://x.org/praktika/certificate/verify/?c=u.s')
  })

  it('reads a well-formed code and rejects junk before the network', () => {
    expect(readVerifyCode('?c=abc-1.Zz_-9')).toBe('abc-1.Zz_-9')
    for (const s of ['', '?c=', '?x=1', '?c=nodot', '?c=a.b<script>', `?c=${'a'.repeat(200)}.b`]) {
      expect(readVerifyCode(s)).toBeNull()
    }
  })

  it('only a strict valid:true answer is "genuine"', () => {
    const ok = { valid: true, course: 'tochka-sborki', completedAt: '2026-09-28T00:00:00.000Z', modules: ['00-kickstart'] }
    expect(interpretVerify(200, ok)).toEqual({ state: 'valid', course: ok.course, completedAt: ok.completedAt, modules: ok.modules })
    expect(interpretVerify(404, { valid: false })).toEqual({ state: 'invalid' })
    expect(interpretVerify(400, { valid: false })).toEqual({ state: 'invalid' })
    expect(interpretVerify(200, { valid: 'true', course: 'x', completedAt: 'y', modules: [] })).toEqual({ state: 'invalid' })
    expect(interpretVerify(200, { ...ok, modules: [1] })).toEqual({ state: 'invalid' })
    expect(interpretVerify(200, null)).toEqual({ state: 'invalid' })
  })

  it('maps verified modules to transformations and drops unknown slugs', () => {
    const lines = verifiedTransformations(['00-kickstart', 'zz-unknown'], 'en')
    expect(lines).toEqual([{ slug: '00-kickstart', ...{ from: MICRO_TRANSFORMATIONS['00-kickstart'].from.en, to: MICRO_TRANSFORMATIONS['00-kickstart'].to.en } }])
  })
})
