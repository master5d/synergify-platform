import { describe, it, expect } from 'vitest'
import { createNotionClient, NotionError } from './client'

const TOKEN = 'secret-token-123'
const res = (status: number, body: unknown, headers: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers })
function harness(queue: (Response | Error)[]) {
  const calls: { url: string; init: RequestInit }[] = [], slept: number[] = []
  const api = createNotionClient({
    token: TOKEN, now: () => 0, sleep: async (ms) => { slept.push(ms) },
    fetchImpl: (async (url: string, init: RequestInit) => { calls.push({ url: String(url), init }); const r = queue.shift()!; if (r instanceof Error) throw r; return r }) as typeof fetch,
  })
  return { api, calls, slept }
}
const err = (status: number, code: string, extra = {}) => res(status, { object: 'error', status, code, message: code, ...extra })

describe('createNotionClient', () => {
  it('заголовки и тело replace_content (markdown v2)', async () => {
    const h = harness([res(200, { object: 'page_markdown', markdown: '' })])
    await h.api.replaceMarkdown('p1', '# x')
    expect(h.calls[0].url).toBe('https://api.notion.com/v1/pages/p1/markdown')
    expect(h.calls[0].init.method).toBe('PATCH')
    const hd = new Headers(h.calls[0].init.headers)
    expect(hd.get('Notion-Version')).toBe('2026-03-11')
    expect(hd.get('Authorization')).toBe(`Bearer ${TOKEN}`)
    expect(JSON.parse(String(h.calls[0].init.body))).toEqual({ type: 'replace_content', replace_content: { new_str: '# x' }, markdown_version: 'v2' })
  })
  it('429 ждёт Retry-After', async () => {
    const h = harness([res(429, { object: 'error', status: 429, code: 'rate_limited', message: 'slow' }, { 'Retry-After': '2' }), res(200, {})])
    await h.api.trashPage('p1')
    expect(h.slept).toContain(2000)
    expect(h.calls).toHaveLength(2)
  })
  it('529 и 504 на идемпотентном вызове — повтор через 1 с и 2 с', async () => {
    const h = harness([err(529, 'overloaded'), err(504, 'gateway_timeout'), res(200, {})])
    await h.api.trashPage('p1')
    expect(h.slept).toEqual(expect.arrayContaining([1000, 2000]))
  })
  it('после 5 попыток — NotionError без токена в тексте', async () => {
    const h = harness(Array.from({ length: 5 }, () => err(503, 'service_unavailable')))
    const e = await h.api.trashPage('p1').catch((x) => x)
    expect(e).toBeInstanceOf(NotionError)
    expect(String(e.message)).not.toContain(TOKEN)
    expect(h.calls).toHaveLength(5)
  })
  it('400 не повторяется', async () => {
    const h = harness([err(400, 'validation_error')])
    await expect(h.api.replaceMarkdown('p', 'x')).rejects.toMatchObject({ status: 400, code: 'validation_error' })
    expect(h.calls).toHaveLength(1)
  })
  it.each([[err(504, 'gateway_timeout')], [Object.assign(new Error('t'), { name: 'TimeoutError' })]])('createPage без ответа — uncertain, без повтора', async (r) => {
    const h = harness([r])
    await expect(h.api.createPage('par', 'T')).rejects.toMatchObject({ code: 'uncertain' })
    expect(h.calls).toHaveLength(1)
  })
  it('createPage при 429 повторяется', async () => {
    const h = harness([err(429, 'rate_limited'), res(200, { object: 'page', id: 'new' })])
    expect(await h.api.createPage('par', 'T')).toEqual({ id: 'new' })
  })
  it('403 restricted_resource с block_limit — blockLimit и понятное сообщение', async () => {
    const h = harness([err(403, 'restricted_resource', { additional_data: { block_limit: 'block_creation' } })])
    const e = await h.api.replaceMarkdown('p', 'x').catch((x) => x)
    expect(e.blockLimit).toBe(true)
    expect(e.message).toMatch(/лимит блоков/)
  })
  it('темп ≤ 3 запросов в секунду', async () => {
    const h = harness([res(200, {}), res(200, {})])
    await h.api.trashPage('a'); await h.api.trashPage('b')
    expect(h.slept).toContain(334)
  })
  it('listChildren проходит все страницы курсора', async () => {
    const h = harness([
      res(200, { results: [{ id: 'c1', type: 'child_page', child_page: { title: 'Старт' } }], has_more: true, next_cursor: 'n2' }),
      res(200, { results: [{ id: 'h1', type: 'heading_3', heading_3: { rich_text: [{ plain_text: 'STATE.md — ' }, { plain_text: 'где остановились' }] } }], has_more: false }),
    ])
    expect(await h.api.listChildren('p')).toEqual([{ id: 'c1', type: 'child_page', text: 'Старт' }, { id: 'h1', type: 'heading_3', text: 'STATE.md — где остановились' }])
    expect(h.calls[1].url).toContain('start_cursor=n2')
  })
  it('429 без Retry-After — пауза по лестнице, 1 с', async () => {
    const h = harness([err(429, 'rate_limited'), res(200, {})])
    await h.api.trashPage('p1')
    expect(h.slept).toContain(1000)
    expect(h.calls).toHaveLength(2)
  })
  it('Retry-After больше 60 с — ждём 60 с', async () => {
    const h = harness([res(429, { object: 'error', status: 429, code: 'rate_limited', message: 'slow' }, { 'Retry-After': '120' }), res(200, {})])
    await h.api.trashPage('p1')
    expect(h.slept).toContain(60000)
  })
  it('createPage при 500 — uncertain, без повтора', async () => {
    const h = harness([err(500, 'internal_server_error')])
    await expect(h.api.createPage('par', 'T')).rejects.toMatchObject({ code: 'uncertain' })
    expect(h.calls).toHaveLength(1)
  })
  it('сетевой сбой на идемпотентном вызове — повтор, после 5 попыток status 0 и code network', async () => {
    const h = harness(Array.from({ length: 5 }, () => new TypeError('fetch failed')))
    await expect(h.api.getPage('p1')).rejects.toMatchObject({ status: 0, code: 'network' })
    expect(h.calls).toHaveLength(5)
  })
  it('токен из тела ответа не попадает в сообщение', async () => {
    const h = harness([err(400, 'validation_error', { message: `bad ${TOKEN}` })])
    const e = await h.api.replaceMarkdown('p', 'x').catch((x) => x)
    expect(e).toBeInstanceOf(NotionError)
    expect(String(e.message)).not.toContain(TOKEN)
  })
})
