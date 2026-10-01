import { describe, it, expect } from 'vitest'
import { certificationIdentity, linkedInAddToProfileUrl, LINKEDIN_ADD_TO_PROFILE } from './linkedin-add-to-profile'
import { REGISTRY } from './academy/registry'

const full = {
  name: 'Точка Сборки',
  organizationName: 'Synergify Institute for AI',
  issuedAt: '2026-09-28T10:00:00.000Z',
  certId: 'abc123.XyZ_-9',
  certUrl: 'https://ai.synergify.com/certificate/verify/?c=abc123.XyZ_-9',
}

const params = (u: string) => new URL(u).searchParams

describe('linkedInAddToProfileUrl', () => {
  it('builds the documented CERTIFICATION_NAME link with every field', () => {
    const u = linkedInAddToProfileUrl(full)!
    expect(u.startsWith(`${LINKEDIN_ADD_TO_PROFILE}?startTask=CERTIFICATION_NAME&`)).toBe(true)
    const p = params(u)
    expect(p.get('name')).toBe('Точка Сборки')
    expect(p.get('organizationName')).toBe('Synergify Institute for AI')
    expect(p.get('issueYear')).toBe('2026')
    expect(p.get('issueMonth')).toBe('9')
    expect(p.get('certId')).toBe('abc123.XyZ_-9')
    expect(p.get('certUrl')).toBe(full.certUrl)
    expect(p.has('organizationId')).toBe(false) // ровно одно из organizationId/organizationName
    expect(p.has('expirationYear')).toBe(false)
  })

  it('encodes spaces as %20 and fully escapes the nested verify URL', () => {
    const u = linkedInAddToProfileUrl(full)!
    expect(u).toContain('organizationName=Synergify%20Institute%20for%20AI')
    expect(u).not.toContain('+')
    expect(u).toContain('certUrl=https%3A%2F%2Fai.synergify.com%2Fcertificate%2Fverify%2F%3Fc%3Dabc123.XyZ_-9')
    // вложенные & и = не рвут внешнюю строку запроса
    const tricky = linkedInAddToProfileUrl({ ...full, name: 'A & B = C', certUrl: 'https://x.test/?a=1&b=2' })!
    expect(params(tricky).get('name')).toBe('A & B = C')
    expect(params(tricky).get('certUrl')).toBe('https://x.test/?a=1&b=2')
  })

  it('takes month/year in UTC (month 1–12, no zero padding)', () => {
    const p = params(linkedInAddToProfileUrl({ ...full, issuedAt: '2026-01-31T23:30:00.000Z' })!)
    expect(p.get('issueYear')).toBe('2026')
    expect(p.get('issueMonth')).toBe('1')
    const d = params(linkedInAddToProfileUrl({ ...full, issuedAt: new Date(Date.UTC(2025, 11, 1)) })!)
    expect(d.get('issueMonth')).toBe('12')
  })

  it('omits empty / missing / invalid optional fields instead of sending blanks', () => {
    const u = linkedInAddToProfileUrl({ ...full, issuedAt: null, certId: '  ', certUrl: '' })!
    const p = params(u)
    for (const k of ['issueYear', 'issueMonth', 'certId', 'certUrl']) expect(p.has(k), k).toBe(false)
    expect(u).not.toMatch(/=(&|$)/)
    const bad = params(linkedInAddToProfileUrl({ ...full, issuedAt: 'not-a-date' })!)
    expect(bad.has('issueYear')).toBe(false)
  })

  it('returns null without a name or an organization', () => {
    expect(linkedInAddToProfileUrl({ ...full, name: '  ' })).toBeNull()
    expect(linkedInAddToProfileUrl({ ...full, organizationName: '' })).toBeNull()
  })

  it('trims values', () => {
    const p = params(linkedInAddToProfileUrl({ ...full, name: '  Точка Сборки ', certId: ' abc ' })!)
    expect(p.get('name')).toBe('Точка Сборки')
    expect(p.get('certId')).toBe('abc')
  })
})

describe('certificationIdentity (LMS/registry.json)', () => {
  it('takes the localized course name and the academy organization from the registry', () => {
    const c = REGISTRY.courses[0]
    expect(certificationIdentity(c.slug, 'ru')).toEqual({ name: c.name.ru, organizationName: REGISTRY.academy.org.name })
    expect(certificationIdentity(c.slug, 'en')).toEqual({ name: c.name.en, organizationName: REGISTRY.academy.org.name })
  })

  it('returns null for an unknown course instead of inventing a name', () => {
    expect(certificationIdentity('no-such-course', 'ru')).toBeNull()
  })
})
