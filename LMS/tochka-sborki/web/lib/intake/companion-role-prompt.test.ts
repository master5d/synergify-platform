import { describe, it, expect } from 'vitest'
import { buildCompanionRolePrompt } from './companion-role-prompt'

// Minimal profile shape consumed via profileToCharter (world_skin + niche + answers).
const profile = { world_skin: 'cyber_noir', niche: 'coach', outcome: 'первые клиенты', answers: '{}' }

describe('buildCompanionRolePrompt', () => {
  it('embeds the personalized charter identity when a profile is given (RU)', () => {
    const p = buildCompanionRolePrompt(profile, 'ru')
    expect(p).toContain('Точка Сборки')
    expect(p).toContain('coach')              // niche flows in via charter
    expect(p).toMatch(/Identity|напарник/)    // charter identity block present
  })

  it('carries a persistent-memory directive (remember across sessions)', () => {
    const p = buildCompanionRolePrompt(profile, 'ru')
    expect(p).toMatch(/все наши сесси|запомни|между сесси/i)
  })

  it('keeps the co-thinking law in both personalized and generic forms', () => {
    expect(buildCompanionRolePrompt(profile, 'ru')).toMatch(/со-мышл|не «сделай за меня»/i)
    expect(buildCompanionRolePrompt(null, 'ru')).toMatch(/со-мышл|не «сделай за меня»/i)
  })

  it('falls back to a generic role when no profile (no world/mentor name)', () => {
    const p = buildCompanionRolePrompt(null, 'ru')
    expect(p).toContain('Точка Сборки')
    expect(p).not.toContain('cyber_noir')
    expect(p).toMatch(/vibe coding|agentic/i)
  })

  it('produces an English variant', () => {
    const en = buildCompanionRolePrompt(profile, 'en')
    expect(en).toMatch(/across.*session|every session|all our session/i)
    expect(en).toMatch(/co-think/i)
    expect(en).toContain('Точка Сборки')
  })
})

describe('anti-sycophancy contract', () => {
  it('carries the firmness contract in the profile branch (ru + en)', () => {
    expect(buildCompanionRolePrompt(profile, 'ru')).toMatch(/льст/)
    expect(buildCompanionRolePrompt(profile, 'en')).toMatch(/flatter/)
  })

  it('carries the firmness contract in the guest branch (ru + en)', () => {
    expect(buildCompanionRolePrompt(null, 'ru')).toMatch(/льст/)
    expect(buildCompanionRolePrompt(null, 'en')).toMatch(/flatter/)
  })
})
