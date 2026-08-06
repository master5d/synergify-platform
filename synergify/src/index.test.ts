import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import worker from './index'

const LISTMONK_URL = 'https://mail.mamaev.coach/api/public/subscription'
const LIST_UUID = 'cf27c05a-a3e2-4ba4-94b8-17a485b8ea95' // RU (default)
const LIST_UUID_EN = '9c837884-ddcb-44be-8df6-db98d589b3f7'

const env = {} as never
const ctx = { waitUntil: (_p: Promise<unknown>) => {} } as unknown as ExecutionContext

type FetchCall = { url: string; init?: RequestInit }
let fetchCalls: FetchCall[] = []

function stubListmonk(status: number, body: unknown = { data: true }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init })
      return new Response(JSON.stringify(body), { status })
    }),
  )
}

beforeEach(() => {
  fetchCalls = []
  stubListmonk(200)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function subscribeReq(body: unknown, method = 'POST') {
  return new Request('https://synergify.com/api/subscribe', {
    method,
    body: method === 'POST' ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('GET /', () => {
  it('200 text/html with Synergify heading and a form', async () => {
    const res = await worker.fetch(new Request('https://synergify.com/'), env, ctx)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/html')
    const html = await res.text()
    expect(html).toContain('Synergify')
    expect(html).toContain('<form')
    // honeypot input present and named website
    expect(html).toContain('name="website"')
    // RU-центричная страница шлёт lang=ru (hidden input, читается и fetch-путём)
    expect(html).toContain('name="lang"')
    expect(html).toContain('value="ru"')
    // RU umbrella entries + subscription form
    expect(html).toContain('Точка Сборки')
    expect(html).toContain('ai.synergify.com')
    expect(html).toContain('academy.synergify.com')
    expect(html).toContain('Новости экосистемы')
  })
})

describe('POST /api/subscribe', () => {
  it('honeypot non-empty → 200 {ok:true} WITHOUT calling listmonk', async () => {
    const res = await worker.fetch(subscribeReq({ email: 'bot@spam.io', website: 'http://spam' }), env, ctx)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(fetchCalls.length).toBe(0)
  })

  it('invalid email (no @) → 400 {ok:false}, no forward', async () => {
    const res = await worker.fetch(subscribeReq({ email: 'not-an-email' }), env, ctx)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(false)
    expect(fetchCalls.length).toBe(0)
  })

  it('non-JSON body → 400, no forward', async () => {
    const req = new Request('https://synergify.com/api/subscribe', { method: 'POST', body: 'garbage' })
    const res = await worker.fetch(req, env, ctx)
    expect(res.status).toBe(400)
    expect(fetchCalls.length).toBe(0)
  })

  it('valid email → forwards to listmonk with list_uuids, returns {ok:true} + CORS origin', async () => {
    const res = await worker.fetch(subscribeReq({ email: ' User@Example.COM ' }), env, ctx)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://mamaev.coach')

    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].url).toBe(LISTMONK_URL)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded).toEqual({
      email: 'user@example.com',
      name: '',
      list_uuids: [LIST_UUID],
    })
  })

  it('lang="en" → forwards to the EN list uuid', async () => {
    const res = await worker.fetch(subscribeReq({ email: 'reader@example.com', lang: 'en' }), env, ctx)
    expect(res.status).toBe(200)
    expect(fetchCalls.length).toBe(1)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded.list_uuids).toEqual([LIST_UUID_EN])
  })

  it('lang missing → RU list uuid (default)', async () => {
    await worker.fetch(subscribeReq({ email: 'reader@example.com' }), env, ctx)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded.list_uuids).toEqual([LIST_UUID])
  })

  it('lang garbage ("EN", "de", 5) → fail-closed to RU list uuid', async () => {
    for (const lang of ['EN', 'de', 5]) {
      fetchCalls = []
      await worker.fetch(subscribeReq({ email: 'reader@example.com', lang }), env, ctx)
      expect(fetchCalls.length).toBe(1)
      const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
      expect(forwarded.list_uuids).toEqual([LIST_UUID])
    }
  })

  it('listmonk 409 / already-subscribed → {ok:true, already:true}', async () => {
    stubListmonk(409, { message: 'already subscribed' })
    const res = await worker.fetch(subscribeReq({ email: 'dup@example.com' }), env, ctx)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, already: true })
  })

  it('listmonk 200 with "already" in body → {ok:true, already:true}', async () => {
    stubListmonk(200, { message: 'You are already subscribed to this list.' })
    const res = await worker.fetch(subscribeReq({ email: 'dup2@example.com' }), env, ctx)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, already: true })
  })

  it('listmonk 500 → 502 {ok:false}', async () => {
    stubListmonk(500, { message: 'boom' })
    const res = await worker.fetch(subscribeReq({ email: 'ok@example.com' }), env, ctx)
    expect(res.status).toBe(502)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(false)
  })

  it('listmonk network error → 502 {ok:false}', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down') }))
    const res = await worker.fetch(subscribeReq({ email: 'ok@example.com' }), env, ctx)
    expect(res.status).toBe(502)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(false)
  })
})

describe('POST /api/subscribe — native form-encoded fallback (no-JS)', () => {
  function formReq(fields: Record<string, string>) {
    return new Request('https://synergify.com/api/subscribe', {
      method: 'POST',
      body: new URLSearchParams(fields).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }

  it('valid email → 303 to /?subscribed=1, forwards to listmonk', async () => {
    const res = await worker.fetch(formReq({ email: ' User@Example.COM ', website: '' }), env, ctx)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/?subscribed=1')
    expect(fetchCalls.length).toBe(1)
    expect(fetchCalls[0].url).toBe(LISTMONK_URL)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded).toEqual({ email: 'user@example.com', name: '', list_uuids: [LIST_UUID] })
  })

  it('form-encoded lang=en → forwards to the EN list uuid', async () => {
    const res = await worker.fetch(formReq({ email: 'reader@example.com', website: '', lang: 'en' }), env, ctx)
    expect(res.status).toBe(303)
    expect(fetchCalls.length).toBe(1)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded.list_uuids).toEqual([LIST_UUID_EN])
  })

  it('form-encoded without lang → RU list uuid (default)', async () => {
    await worker.fetch(formReq({ email: 'reader@example.com', website: '' }), env, ctx)
    const forwarded = JSON.parse(String(fetchCalls[0].init?.body))
    expect(forwarded.list_uuids).toEqual([LIST_UUID])
  })

  it('honeypot non-empty → 303 success WITHOUT calling listmonk', async () => {
    const res = await worker.fetch(formReq({ email: 'bot@spam.io', website: 'http://spam' }), env, ctx)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/?subscribed=1')
    expect(fetchCalls.length).toBe(0)
  })

  it('invalid email → 303 to /?subscribed=invalid, no forward', async () => {
    const res = await worker.fetch(formReq({ email: 'not-an-email' }), env, ctx)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/?subscribed=invalid')
    expect(fetchCalls.length).toBe(0)
  })

  it('listmonk 409 → 303 to /?subscribed=already', async () => {
    stubListmonk(409, { message: 'already subscribed' })
    const res = await worker.fetch(formReq({ email: 'dup@example.com' }), env, ctx)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/?subscribed=already')
  })

  it('listmonk 500 → 303 to /?subscribed=error', async () => {
    stubListmonk(500, { message: 'boom' })
    const res = await worker.fetch(formReq({ email: 'ok@example.com' }), env, ctx)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/?subscribed=error')
  })

  it('page script handles the subscribed query param statuses', async () => {
    const res = await worker.fetch(new Request('https://synergify.com/'), env, ctx)
    const html = await res.text()
    expect(html).toContain('subscribed')
  })
})

describe('OPTIONS /api/subscribe', () => {
  it('204 preflight with CORS headers', async () => {
    const res = await worker.fetch(subscribeReq(undefined, 'OPTIONS'), env, ctx)
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://mamaev.coach')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
  })
})

describe('fallback', () => {
  it('unknown path → 404', async () => {
    const res = await worker.fetch(new Request('https://synergify.com/nope'), env, ctx)
    expect(res.status).toBe(404)
  })

  it('GET /api/subscribe → 404 (POST-only route)', async () => {
    const res = await worker.fetch(new Request('https://synergify.com/api/subscribe'), env, ctx)
    expect(res.status).toBe(404)
  })
})
