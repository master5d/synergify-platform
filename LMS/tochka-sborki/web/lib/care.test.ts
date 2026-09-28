import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { CARE, careCopy, careSiteFor, careTopics, validateCareFields, fetchCareEmail, submitCare, type CareFields } from './care'

const HERE = dirname(fileURLToPath(import.meta.url))
const ok = (status = 200, body: unknown = {}) => ({ ok: status < 400, status, json: async () => body }) as Response
const fields: CareFields = { topic: 'stuck', message: 'Юнит не открывается', email: 'a@b.co', pageUrl: '', company: '' }

describe('care config (LMS/care.json — общий с воркером и академией)', () => {
  it('closed topic list in the owner-requested order, both locales', () => {
    expect(CARE.topics.map(t => t.key)).toEqual(['access', 'stuck', 'content', 'tech', 'idea', 'other'])
    expect(careTopics('ru').map(t => t.label)).toEqual(['Вход и доступ', 'Застрял в уроке', 'Вопрос по содержанию', 'Техническая проблема', 'Предложение', 'Другое'])
    expect(careTopics('en')).toHaveLength(6)
  })

  it('response time comes from the one config, and the page promises exactly it', () => {
    expect(careCopy('ru').promises.join(' ')).toContain(CARE.responseTime.ru)
    expect(careCopy('en').promises.join(' ')).toContain(CARE.responseTime.en)
    expect(careCopy('ru').success).toContain(CARE.responseTime.ru)
  })

  it('course on the academy sub-path reports as «academy», the course domain as «tochka-sborki»', () => {
    expect(careSiteFor('https://academy.synergify.com/praktika')).toBe('academy')
    expect(careSiteFor('https://ai.synergify.com')).toBe('tochka-sborki')
  })
})

describe('validateCareFields', () => {
  it('passes a complete request, page URL optional', () => {
    expect(validateCareFields(fields)).toEqual([])
  })
  it('flags missing topic, short message and bad email', () => {
    expect(validateCareFields({ ...fields, topic: '', message: 'hi', email: 'nope' })).toEqual(['topic', 'message', 'email'])
  })
})

describe('network (stub fetch)', () => {
  it('prefills the signed-in email, guest → empty', async () => {
    expect(await fetchCareEmail(vi.fn(async () => ok(200, { email: 'me@x.io' })) as unknown as typeof fetch)).toBe('me@x.io')
    expect(await fetchCareEmail(vi.fn(async () => ok(401)) as unknown as typeof fetch)).toBe('')
    expect(await fetchCareEmail(vi.fn(async () => { throw new Error('net') }) as unknown as typeof fetch)).toBe('')
  })

  it('POSTs /api/care with site, locale and the honeypot; maps 429 and network errors', async () => {
    const f = vi.fn(async () => ok(200))
    expect(await submitCare(f as unknown as typeof fetch, fields, { site: 'tochka-sborki', locale: 'ru' })).toBe('ok')
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/care')
    expect(JSON.parse(String(init.body))).toMatchObject({ site: 'tochka-sborki', locale: 'ru', topic: 'stuck', company: '' })
    expect(await submitCare(vi.fn(async () => ok(429)) as unknown as typeof fetch, fields, { site: 'academy', locale: 'en' })).toBe('rate-limited')
    expect(await submitCare(vi.fn(async () => ok(500)) as unknown as typeof fetch, fields, { site: 'academy', locale: 'en' })).toBe('error')
    expect(await submitCare(vi.fn(async () => { throw new Error('x') }) as unknown as typeof fetch, fields, { site: 'academy', locale: 'en' })).toBe('error')
  })
})

describe('care is not the donation page', () => {
  it('/care/ and /support/ are different routes; the footer links care, not support, as help', () => {
    const footer = readFileSync(join(HERE, '..', 'components', 'footer.tsx'), 'utf8')
    expect(footer).toContain('${prefix}/care/')
    expect(readFileSync(join(HERE, '..', 'app', 'care', 'page.tsx'), 'utf8')).toContain('CarePage locale="ru"')
    expect(readFileSync(join(HERE, '..', 'app', 'en', 'care', 'page.tsx'), 'utf8')).toContain('CarePage locale="en"')
  })
})
