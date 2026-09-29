import { describe, it, expect } from 'vitest'
import { buildCompanionCharter, profileToCharter } from './charter'

describe('buildCompanionCharter', () => {
  it('fills the 7 blocks from a v2 profile', () => {
    const c = buildCompanionCharter({
      locale: 'ru', skinName: 'Кибер-Нуар', mentorName: 'Фиксер', niche: 'coach',
      outcome: 'выйти на первых клиентов',
      relational: { rhythm: 'suave', errorStyle: 'soft_feedback', anchor: 'support', attention: 'short' },
    })
    expect(c).toContain('Identity')
    expect(c).toContain('Goal')
    expect(c).toContain('выйти на первых клиентов')
    expect(c).not.toContain('MBTI')
  })
  it('degrades when fields are missing', () => {
    const c = buildCompanionCharter({ locale: 'en' })
    expect(c).toContain('Identity')
    expect(c).toContain('Goal')
  })
})

describe('profileToCharter', () => {
  const row = {
    world_skin: 'space-opera',
    niche: 'coach',
    answers: JSON.stringify({ V_OUTCOME: 'собрать лендинг', V_RHYTHM: 'fuego', V_ERR: 'calm' }),
  }
  it('строит непустой устав с niche (ru/en)', () => {
    for (const loc of ['ru', 'en'] as const) {
      const c = profileToCharter(row, loc)
      expect(c.length).toBeGreaterThan(0)
      expect(c).toContain('coach')
    }
  })
  it('MBTI из анкеты в устав не попадает (не основание адаптации, Pashler 2008)', () => {
    const c = profileToCharter({ ...row, answers: JSON.stringify({ V_MBTI_SR: 'INFP', V_ERR: 'fix_immediately' }) }, 'ru')
    expect(c).not.toContain('INFP')
    expect(c).not.toContain('MBTI')
  })
  it('битый answers не роняет', () => {
    expect(() => profileToCharter({ world_skin: 'wanderer', answers: '{bad' }, 'ru')).not.toThrow()
  })
})
