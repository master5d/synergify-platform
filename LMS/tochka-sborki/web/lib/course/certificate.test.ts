import { describe, it, expect } from 'vitest'
import { resolveCertificate, CERTIFICATE, CERT_PALETTE } from './certificate'
import type { ResolvedCertificate } from './certificate'
import { REGISTRY } from '@/lib/academy/registry'

const FIELDS: (keyof ResolvedCertificate)[] = [
  'brand', 'ticketLabel', 'heading', 'presentedTo', 'forCompleting',
  'courseName', 'milestone', 'footerMeta', 'founderName', 'founderTitle',
  'publisher', 'url',
]

describe('resolveCertificate', () => {
  it('returns non-empty strings for every field in both locales', () => {
    for (const locale of ['ru', 'en'] as const) {
      const r = resolveCertificate(locale)
      for (const f of FIELDS) {
        expect(typeof r[f]).toBe('string')
        expect(r[f].trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('localizes heading and passes url through unchanged', () => {
    const ru = resolveCertificate('ru')
    const en = resolveCertificate('en')
    expect(ru.heading).not.toBe(en.heading)
    expect(ru.url).toBe(CERTIFICATE.url)
    expect(en.url).toBe(CERTIFICATE.url)
  })

  it('resolves from an injected source', () => {
    const fake = { ...CERTIFICATE, heading: { ru: 'РУ', en: 'EN' } }
    expect(resolveCertificate('ru', fake).heading).toBe('РУ')
    expect(resolveCertificate('en', fake).heading).toBe('EN')
  })

  it('derives the publisher from the academy org registry in both locales', () => {
    const org = REGISTRY.academy.org.name
    expect(org).toBe('Synergify Institute for AI')
    expect(resolveCertificate('en').publisher).toContain(org)
    expect(resolveCertificate('ru').publisher).toContain(org)
  })

  it('uses a single gold accent', () => {
    expect(CERT_PALETTE.gold).toBe('#e8c66a')
  })
})
