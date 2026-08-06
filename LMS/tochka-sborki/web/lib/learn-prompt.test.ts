import { describe, it, expect } from 'vitest'
import { buildLearnPrompt, buildBootstrapDeepLink, agentUrl } from './learn-prompt'

const base = {
  locale: 'ru' as const,
  moduleTitle: 'Промпт-инжиниринг',
  unitIndex: 1,
  totalUnits: 3,
}

describe('buildLearnPrompt', () => {
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

describe('buildBootstrapDeepLink', () => {
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

describe('anti-sycophancy contract', () => {
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
