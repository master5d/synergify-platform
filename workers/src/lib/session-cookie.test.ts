import { describe, it, expect } from 'vitest'
import { cookieDomain, sessionSetCookies, sessionClearCookies } from './session-cookie'

describe('session cookie (вариант A: одна сессия школы на .synergify.com)', () => {
  it('school hosts share the .synergify.com domain; legacy hosts stay host-only', () => {
    expect(cookieDomain('ai.synergify.com')).toBe('.synergify.com')
    expect(cookieDomain('academy.synergify.com')).toBe('.synergify.com')
    expect(cookieDomain('synergify.com')).toBe('.synergify.com')
    expect(cookieDomain('ai.mamaev.coach')).toBeNull()
    expect(cookieDomain('evil-synergify.com')).toBeNull()
  })

  it('login on a school host clears the old host-only cookie, then sets the domain cookie', () => {
    const [clear, set] = sessionSetCookies('JWT', 'academy.synergify.com')
    expect(clear).toMatch(/^session=; .*Max-Age=0/)
    expect(clear).not.toContain('Domain=')
    expect(set).toMatch(/^session=JWT; /)
    expect(set).toContain('Domain=.synergify.com')
    expect(set).toContain('HttpOnly')
    expect(set).toContain('Secure')
    expect(set).toContain('SameSite=Strict')
  })

  it('login on a legacy host sets one host-only cookie', () => {
    const cookies = sessionSetCookies('JWT', 'ai.mamaev.coach')
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).not.toContain('Domain=')
  })

  it('logout on a school host clears both the host-only and the domain cookie', () => {
    const cookies = sessionClearCookies('ai.synergify.com')
    expect(cookies).toHaveLength(2)
    expect(cookies.every((c) => c.startsWith('session=;') && c.includes('Max-Age=0'))).toBe(true)
    expect(cookies[1]).toContain('Domain=.synergify.com')
  })
})
