import { describe, it, expect } from 'vitest'
import { buildCompanionRolePrompt } from './companion-role-prompt'
import { PACK_SLUG } from '../pack'
import { COURSE } from '../course'
import { COMPANION } from '../course/companion'

// Minimal profile shape consumed via profileToCharter (world_skin + niche + answers).
const profile = { world_skin: 'cyber_noir', niche: 'coach', outcome: 'первые клиенты', answers: '{}' }

// Формулировки устава — данные курса (packs/<pack>/course/companion.ts → standing), поэтому
// проверки текста Точки Сборки привязаны к её pack'у; инварианты шва — ниже, для любого pack'а.
const TS = PACK_SLUG === 'tochka-sborki'

describe.runIf(TS)('buildCompanionRolePrompt (tochka-sborki)', () => {
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

describe.runIf(TS)('anti-sycophancy contract (tochka-sborki)', () => {
  it('carries the firmness contract in the profile branch (ru + en)', () => {
    expect(buildCompanionRolePrompt(profile, 'ru')).toMatch(/льст/)
    expect(buildCompanionRolePrompt(profile, 'en')).toMatch(/flatter/)
  })

  it('carries the firmness contract in the guest branch (ru + en)', () => {
    expect(buildCompanionRolePrompt(null, 'ru')).toMatch(/льст/)
    expect(buildCompanionRolePrompt(null, 'en')).toMatch(/flatter/)
  })
})

// Инвариант шва (intake LMS#16): стоячая роль говорит от имени АКТИВНОГО курса и несёт его границы.
describe('standing role belongs to the active course (any pack)', () => {
  it('names the active course, and a non-default course never names «Точка Сборки»', () => {
    for (const p of [buildCompanionRolePrompt(null, 'ru'), buildCompanionRolePrompt(profile, 'ru')]) {
      expect(p).toContain(COURSE.name)
      if (!TS) expect(p).not.toContain('Точка Сборки')
    }
    if (!TS) {
      expect(buildCompanionRolePrompt(null, 'en')).not.toContain('Точка Сборки')
      expect(buildCompanionRolePrompt(profile, 'en')).not.toContain('Точка Сборки')
    }
  })

  it('carries every boundary the course declares', () => {
    const p = buildCompanionRolePrompt(profile, 'ru')
    for (const g of COMPANION.guardrails) expect(p).toContain(g.ru)
  })

  it('a course without the questionnaire ignores a profile', () => {
    if (COMPANION.usesProfile) return
    const p = buildCompanionRolePrompt(profile, 'ru')
    expect(p).not.toContain('coach')
    expect(p).not.toContain('cyber_noir')
    expect(p).toBe(buildCompanionRolePrompt(null, 'ru'))
  })
})
