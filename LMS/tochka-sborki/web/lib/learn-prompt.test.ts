import { describe, it, expect } from 'vitest'
import { buildLearnPrompt, buildBootstrapDeepLink, agentUrl } from './learn-prompt'
import { PACK_SLUG } from './pack'
import { COURSE } from './course'

const base = {
  locale: 'ru' as const,
  moduleTitle: 'Промпт-инжиниринг',
  unitIndex: 1,
  totalUnits: 3,
}

// Формулировки компаньона — данные курса (packs/<pack>/course/companion.ts), поэтому
// содержательные проверки привязаны к своему pack'у; общие инварианты — ниже, для любого.
const TS = PACK_SLUG === 'tochka-sborki'
const LP = PACK_SLUG === 'living-practice'

describe.runIf(TS)('buildLearnPrompt (tochka-sborki)', () => {
  it('embeds co-thinking identity, Kolb, bisociation, and the 5-step loop', () => {
    const p = buildLearnPrompt(base)
    expect(p).toContain('co-thinking')
    expect(p).toMatch(/Колб/)
    expect(p).toMatch(/бисоциаци/)
    expect(p).toContain('intent')
    expect(p).toContain('системное мышление')
    expect(p).toContain('дизайн-мышление')
    expect(p).toContain('todo')
    expect(p).toContain('юнит 2 из 3')
  })

  it('fills profile slots when present (skin, mentor, niche, outcome)', () => {
    const p = buildLearnPrompt({ ...base, skinName: 'Кибер-Нуар', mentorName: 'Фиксер', niche: 'coach', outcome: 'выйти на первых клиентов' })
    expect(p).toContain('«Кибер-Нуар»')
    expect(p).toContain('Фиксер')
    expect(p).toContain('коучинг')
    expect(p).toContain('выйти на первых клиентов')
  })

  it('mode changes the scaffolding directive', () => {
    const cmd = buildLearnPrompt({ ...base, mode: 'commander' })
    const arch = buildLearnPrompt({ ...base, mode: 'archmage' })
    expect(cmd).toMatch(/максимум опор/)
    expect(arch).toMatch(/Минимум опор/)
    expect(cmd).not.toEqual(arch)
  })

  it('attaches the applied challenge when given', () => {
    const p = buildLearnPrompt({ ...base, appliedChallenge: 'Собери промпт под свою задачу.' })
    expect(p).toContain('Собери промпт под свою задачу.')
  })

  it('produces an English variant', () => {
    const p = buildLearnPrompt({ ...base, locale: 'en', mode: 'copilot' })
    expect(p).toContain('co-think')
    expect(p).toContain('Kolb')
    expect(p).toMatch(/unit 2 of 3/)
  })

  it('adds a bonding directive from MBTI + relational style', () => {
    const p = buildLearnPrompt({ ...base, mbti: 'INFP', relational: { rhythm: 'suave', errorStyle: 'soft_feedback', anchor: 'support', attention: 'short' } })
    expect(p).toContain('INFP')
    expect(p).toMatch(/мягк/i)        // soft feedback → gentle correction
    expect(p).toMatch(/корот|3–5|мелк/) // short attention → short turns
  })

  it('omits the bonding block entirely when absent', () => {
    const p = buildLearnPrompt(base)
    expect(p).not.toContain('MBTI')
  })
})

describe.runIf(TS)('buildBootstrapDeepLink (tochka-sborki)', () => {
  it('is compact (≤1500 chars) and carries co-thinking + module + the loop', () => {
    const p = buildBootstrapDeepLink({ ...base, skinName: 'Кибер-Нуар', mentorName: 'Фиксер' })
    expect(p.length).toBeLessThanOrEqual(1500)
    expect(p).toMatch(/со-мышл|co-think/i)
    expect(p).toContain('Промпт-инжиниринг')
    expect(p).toContain('Фиксер')
    expect(p).toMatch(/намерени|intent/i)
  })

  it('caps a long outcome so the URL stays bounded', () => {
    const long = 'цель '.repeat(400) // ~2000 chars
    const p = buildBootstrapDeepLink({ ...base, outcome: long })
    expect(p.length).toBeLessThanOrEqual(1500)
    expect(p).toContain('…')
  })

  it('produces an English variant', () => {
    const p = buildBootstrapDeepLink({ ...base, locale: 'en' })
    expect(p).toMatch(/co-think/i)
    expect(p).toMatch(/intent/i)
  })
})

describe('agentUrl', () => {
  it('builds chatgpt and claude deep-links with the prompt url-encoded', () => {
    expect(agentUrl('chatgpt', 'a b')).toBe('https://chatgpt.com/?q=a%20b')
    expect(agentUrl('claude', 'a b')).toBe('https://claude.ai/new?q=a%20b')
  })
})

describe.runIf(TS)('anti-sycophancy contract (tochka-sborki)', () => {
  it('buildLearnPrompt carries the firmness contract (ru + en)', () => {
    expect(buildLearnPrompt(base)).toMatch(/льст/)
    expect(buildLearnPrompt({ ...base, locale: 'en' })).toMatch(/flatter/)
  })

  it('buildBootstrapDeepLink carries the compact clause and stays within the cap', () => {
    const ru = buildBootstrapDeepLink(base)
    const en = buildBootstrapDeepLink({ ...base, locale: 'en' })
    expect(ru).toMatch(/льст/)
    expect(en).toMatch(/flatter/)
    expect(ru.length).toBeLessThanOrEqual(1500)
    expect(en.length).toBeLessThanOrEqual(1500)
  })
})

// Инвариант шва (intake LMS#16): компаньон говорит от имени АКТИВНОГО курса и никогда —
// от имени чужого. До фикса «Тишина» отдавала своим студентам промпт «курс „Точка Сборки“».
describe('companion belongs to the active course (any pack)', () => {
  it('names the active course, and a non-default course never names «Точка Сборки»', () => {
    const p = buildLearnPrompt(base)
    const b = buildBootstrapDeepLink(base)
    expect(p).toContain(COURSE.name)
    expect(b).toContain(COURSE.name)
    if (!TS) {
      expect(p).not.toContain('Точка Сборки')
      expect(b).not.toContain('Точка Сборки')
      expect(buildLearnPrompt({ ...base, locale: 'en' })).not.toContain('Точка Сборки')
      expect(buildBootstrapDeepLink({ ...base, locale: 'en' })).not.toContain('Точка Сборки')
    }
  })

  it('bootstrap stays within the URL cap in both locales', () => {
    expect(buildBootstrapDeepLink(base).length).toBeLessThanOrEqual(1500)
    expect(buildBootstrapDeepLink({ ...base, locale: 'en' }).length).toBeLessThanOrEqual(1500)
  })
})

describe.runIf(LP)('living-practice companion keeps the boundaries the course promises', () => {
  it('carries the prohibitions from u1/u3/u5/u7 (ru + en)', () => {
    const ru = buildLearnPrompt(base)
    expect(ru).toMatch(/диагноз/)
    expect(ru).toMatch(/кризисн/)
    expect(ru).toMatch(/дольше|интенсивн/)
    expect(ru).toMatch(/травм/)
    expect(ru).toMatch(/по инерции согласишься/)
    const en = buildLearnPrompt({ ...base, locale: 'en' })
    expect(en).toMatch(/diagnos/)
    expect(en).toMatch(/crisis/)
    expect(en).toMatch(/longer|intense/)
    expect(en).toMatch(/trauma/)
  })

  it('ignores the vibe-coding questionnaire profile entirely', () => {
    const p = buildLearnPrompt({
      ...base,
      skinName: 'Кибер-Нуар', mentorName: 'Фиксер', niche: 'coach', outcome: 'выйти на первых клиентов',
      appliedChallenge: 'Собери промпт под свою задачу.', mode: 'commander', mbti: 'INFP',
    })
    for (const leak of ['Кибер-Нуар', 'Фиксер', 'коучинг', 'выйти на первых клиентов', 'Собери промпт', 'опор', 'INFP', 'Колб', 'todo']) {
      expect(p, leak).not.toContain(leak)
    }
  })

  it('bootstrap carries the core prohibitions and no profile', () => {
    const b = buildBootstrapDeepLink({ ...base, mentorName: 'Фиксер', outcome: 'выйти на первых клиентов' })
    expect(b).toMatch(/диагноз/)
    expect(b).toMatch(/кризисн/)
    expect(b).not.toContain('Фиксер')
    expect(b).not.toContain('выйти на первых клиентов')
  })
})
