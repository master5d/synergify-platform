import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseOutline, completedModules, upsertProgressSubscriber } from './progress-events'

const env = {
  LISTMONK_URL: 'https://listmonk.test',
  LISTMONK_API_USER: 'api',
  LISTMONK_API_TOKEN: 'tok',
  CF_ACCESS_CLIENT_ID: 'cf-id',
  CF_ACCESS_CLIENT_SECRET: 'cf-secret',
} as any

afterEach(() => vi.restoreAllMocks())

describe('parseOutline', () => {
  it('accepts module → units map', () => {
    expect(parseOutline({ '01-intro': ['u1', 'u2'] })).toEqual({ '01-intro': ['u1', 'u2'] })
  })
  it.each([null, [], 'x', {}, { m: [] }, { m: 'u1' }, { m: [1] }, { 'bad slug': ['u1'] }, { m: ['../x'] }])(
    'rejects garbage %j', raw => { expect(parseOutline(raw)).toBeNull() },
  )
})

describe('completedModules', () => {
  it('module counts only when every unit is completed', () => {
    const outline = { a: ['u1', 'u2'], b: ['u1'] }
    expect(completedModules(outline, new Set(['a/u1', 'b/u1']))).toEqual(['b'])
    expect(completedModules(outline, new Set(['a/u1', 'a/u2', 'b/u1']))).toEqual(['a', 'b'])
  })
})

describe('upsertProgressSubscriber', () => {
  it('existing subscriber: PUT merges attribs and lists, keeps status', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_u, init) => {
      if (!init?.method) {
        return Response.json({ data: { results: [{
          id: 42, email: 'a@b.com', name: 'Ann', status: 'enabled',
          attribs: { city: 'X', completed_modules: ['c/m0'] },
          lists: [{ id: 7 }],
        }] } })
      }
      return Response.json({})
    })
    const ok = await upsertProgressSubscriber(env, 9, 'A@B.com', { modules: ['c/m0', 'c/m1'], courses: [] })
    expect(ok).toBe(true)
    const [lookupUrl] = fetchMock.mock.calls[0]
    expect(decodeURIComponent(String(lookupUrl))).toContain("subscribers.email = 'a@b.com'")
    const [url, init] = fetchMock.mock.calls[1]
    expect(url).toBe('https://listmonk.test/api/subscribers/42')
    expect(init!.method).toBe('PUT')
    expect(JSON.parse(init!.body as string)).toEqual({
      email: 'a@b.com', name: 'Ann', status: 'enabled',
      lists: [7, 9],
      attribs: { city: 'X', completed_modules: ['c/m0', 'c/m1'], completed_course: [] },
      preconfirm_subscriptions: false,
    })
  })

  it('blocklisted subscriber is left alone', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ data: { results: [{
      id: 1, email: 'a@b.com', name: '', status: 'blocklisted', attribs: {}, lists: [],
    }] } }))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(await upsertProgressSubscriber(env, 9, 'a@b.com', { modules: ['c/m'], courses: [] })).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('escapes quotes in the lookup query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('x', { status: 500 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await upsertProgressSubscriber(env, 9, "o'x@b.com", { modules: [], courses: [] })).toBe(false)
    expect(decodeURIComponent(String(fetchMock.mock.calls[0][0]))).toContain("'o''x@b.com'")
  })

  it('no credentials → false without a call', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    expect(await upsertProgressSubscriber({ ...env, LISTMONK_API_TOKEN: '' }, 9, 'a@b.com', { modules: [], courses: [] })).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
