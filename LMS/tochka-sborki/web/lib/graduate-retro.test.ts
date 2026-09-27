import { describe, it, expect, vi } from 'vitest'
import {
  validateRetro,
  fetchIsGraduate,
  submitRetro,
  buildRetroMarkdown,
  RETRO_LESSON_KEY,
  EMPTY_RETRO_FIELDS,
} from './graduate-retro'

const FIELDS = {
  before: 'copy-paste from ChatGPT',
  after: 'agents with MCP and hooks',
  prompt: 'best prompt of the course',
  plan: 'ship one automation a week',
  review: 'loved it',
}

describe('validateRetro', () => {
  it('all four questions are required — empty fields come back as missing', () => {
    expect(validateRetro(EMPTY_RETRO_FIELDS)).toEqual(['before', 'after', 'prompt', 'plan', 'review'])
  })
  it('whitespace-only counts as empty', () => {
    expect(validateRetro({ ...FIELDS, plan: '   ' })).toEqual(['plan'])
  })
  it('a fully filled form has no missing fields', () => {
    expect(validateRetro(FIELDS)).toEqual([])
  })
})

describe('fetchIsGraduate', () => {
  it('true only when /api/auth/me is ok and carries an email', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ email: 'a@b.com' }) })
    expect(await fetchIsGraduate(fetchImpl as unknown as typeof fetch)).toBe(true)
    expect(fetchImpl).toHaveBeenCalledWith('/api/auth/me', { credentials: 'include' })
  })
  it('false when not ok (not logged in)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    expect(await fetchIsGraduate(fetchImpl as unknown as typeof fetch)).toBe(false)
  })
  it('false when ok but no email', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    expect(await fetchIsGraduate(fetchImpl as unknown as typeof fetch)).toBe(false)
  })
  it('false on network reject (fail closed, matches auth-check.ts)', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
    expect(await fetchIsGraduate(fetchImpl as unknown as typeof fetch)).toBe(false)
  })
})

describe('submitRetro', () => {
  it('posts to /api/feedback with credentials, the retro lesson key, and review in `other`', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true })
    const result = await submitRetro(fetchImpl as unknown as typeof fetch, FIELDS, 'ru')
    expect(result).toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('/api/feedback')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    const body = JSON.parse(init.body)
    expect(body).toEqual({
      lesson: RETRO_LESSON_KEY,
      other: 'loved it',
      locale: 'ru',
      retroBefore: FIELDS.before,
      retroAfter: FIELDS.after,
      retroPrompt: FIELDS.prompt,
      retroPlan: FIELDS.plan,
    })
  })
  it('returns ok:false on a non-2xx response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false })
    expect(await submitRetro(fetchImpl as unknown as typeof fetch, FIELDS, 'ru')).toEqual({ ok: false })
  })
  it('returns ok:false on a network reject', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
    expect(await submitRetro(fetchImpl as unknown as typeof fetch, FIELDS, 'ru')).toEqual({ ok: false })
  })
})

describe('buildRetroMarkdown', () => {
  const labels = { beforeLabel: 'Before', afterLabel: 'After', planLabel: 'Plan' }

  it('renders name and date in the heading, and the three keepable sections', () => {
    const md = buildRetroMarkdown(FIELDS, { name: 'Sasha', date: '2026-09-27' }, labels)
    expect(md).toContain('# Sasha — 2026-09-27')
    expect(md).toContain('## Before\ncopy-paste from ChatGPT')
    expect(md).toContain('## After\nagents with MCP and hooks')
    expect(md).toContain('## Plan\nship one automation a week')
  })

  it('does not leak the best-prompt or review fields into the download (server-only)', () => {
    const md = buildRetroMarkdown(FIELDS, { name: '', date: '2026-09-27' }, labels)
    expect(md).not.toContain(FIELDS.prompt)
    expect(md).not.toContain(FIELDS.review)
  })

  it('omits the name dash when no name is given', () => {
    const md = buildRetroMarkdown(FIELDS, { name: '', date: '2026-09-27' }, labels)
    expect(md.split('\n')[0]).toBe('# 2026-09-27')
  })
})
