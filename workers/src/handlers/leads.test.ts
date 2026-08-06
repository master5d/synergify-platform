import { describe, it, expect, vi, afterEach } from 'vitest'
import { listLeads, syncContacts } from './leads'

function fakeDb(rows: any[] = []) {
  const calls: { sql: string; binds: any[] }[] = []
  const make = (sql: string) => ({
    bind(...binds: any[]) { calls.push({ sql, binds }); return { all: async () => ({ results: rows }) } },
    all: async () => ({ results: rows }),
  })
  return { calls, prepare(sql: string) { return make(sql) } } as any
}

afterEach(() => vi.restoreAllMocks())

describe('listLeads', () => {
  it('selects lead fields ordered by created_at desc', async () => {
    const db = fakeDb([{ id: 'u1', email: 'a@b.com', created_at: 2, language: 'ru', source: 'site', telegram_handle: null }])
    const res = await listLeads(db, {})
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].email).toBe('a@b.com')
    expect(db.calls[0].sql).toMatch(/ORDER BY created_at DESC/)
    expect(db.calls[0].sql).toMatch(/FROM users/)
  })
  it('adds an email LIKE filter when q is given', async () => {
    const db = fakeDb([])
    await listLeads(db, { q: 'bob' })
    expect(db.calls[0].sql).toMatch(/email LIKE/)
    expect(db.calls[0].binds).toContain('%bob%')
  })
})

describe('syncContacts', () => {
  it('pushes every user to listmonk and returns counts', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    const env = {
      DB: fakeDb([{ email: 'a@b.com' }, { email: 'c@d.com' }]),
      LISTMONK_URL: 'https://listmonk.mamaev.coach',
      LISTMONK_API_USER: 'user',
      LISTMONK_API_TOKEN: 'tok',
      CF_ACCESS_CLIENT_ID: 'cf-id',
      CF_ACCESS_CLIENT_SECRET: 'cf-secret',
      LISTMONK_CRM_LIST_ID: '3',
    } as any
    const res = await syncContacts(env)
    const body = await res.json()
    expect(body.total).toBe(2)
    expect(body.synced).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
