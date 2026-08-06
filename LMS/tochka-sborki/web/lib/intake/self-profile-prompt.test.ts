import { describe, it, expect } from 'vitest'
import { buildSelfProfilePrompt } from './self-profile-prompt'

describe('buildSelfProfilePrompt', () => {
  const charter = '# Agent Charter\nField: coaching'
  it('встраивает charter и запрос профиля (ru)', () => {
    const p = buildSelfProfilePrompt(charter, 'ru')
    expect(p).toContain(charter)
    expect(p.toLowerCase()).toContain('профиль')
    expect(p.length).toBeGreaterThan(charter.length)
  })
  it('встраивает charter и запрос профиля (en)', () => {
    const p = buildSelfProfilePrompt(charter, 'en')
    expect(p).toContain(charter)
    expect(p.toLowerCase()).toContain('profile')
  })
  it('ru и en различаются', () => {
    expect(buildSelfProfilePrompt(charter, 'ru')).not.toBe(buildSelfProfilePrompt(charter, 'en'))
  })
})
