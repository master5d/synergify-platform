import { describe, it, expect } from 'vitest'
import { handleLeadCapture } from './leads-capture'
import type { Env } from '../lib/types'

type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { existing?: boolean; calls?: DbCall[] } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          first: async () => (opts.existing ? { id: 'existing-user-id' } : null),
          run: async () => ({ success: true }),
        }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    WORKER_JWT_SECRET: 'test-secret',
    LISTMONK_URL: '', // empty → addCrmContact no-ops, no network in tests
  } as Env
}

function req(body: unknown) {
  return new Request('https://ai.synergify.com/api/leads/capture', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const eventLeadsInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO event_leads/.test(c.sql))
const usersInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO users/.test(c.sql))

const validBody = {
  name: 'Sasha', email: 'Lead@Example.com ', phone: '+1 615 555 0100',
  city: 'Nashville', event: 'retreat-inner-evolution', message: 'interested', consent: true,
}

const ctx = { waitUntil: (_p: Promise<unknown>) => {} } as unknown as ExecutionContext

describe('handleLeadCapture', () => {
  it('400 on missing email', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req({ consent: true }), makeEnv({ calls }), ctx)
    expect(res.status).toBe(400)
    expect(eventLeadsInsert(calls)).toBeUndefined()
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('400 on malformed email', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req({ email: 'nope', consent: true }), makeEnv({ calls }), ctx)
    expect(res.status).toBe(400)
    expect(eventLeadsInsert(calls)).toBeUndefined()
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('400 on missing consent', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req({ email: 'a@b.co' }), makeEnv({ calls }), ctx)
    expect(res.status).toBe(400)
    expect(eventLeadsInsert(calls)).toBeUndefined()
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('honeypot filled → 200 with no DB writes', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req({ ...validBody, company: 'spam-bot' }), makeEnv({ calls }), ctx)
    expect(res.status).toBe(200)
    expect(eventLeadsInsert(calls)).toBeUndefined()
    expect(usersInsert(calls)).toBeUndefined()
  })

  it('valid new lead → 200, inserts event_leads + upserts users (normalized email)', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req(validBody), makeEnv({ existing: false, calls }), ctx)
    expect(res.status).toBe(200)
    const el = eventLeadsInsert(calls)
    expect(el).toBeDefined()
    expect(el!.binds).toContain('lead@example.com') // trimmed + lowercased
    expect(usersInsert(calls)).toBeDefined()
  })

  it('existing user → 200, inserts event_leads but NOT a second users row', async () => {
    const calls: DbCall[] = []
    const res = await handleLeadCapture(req(validBody), makeEnv({ existing: true, calls }), ctx)
    expect(res.status).toBe(200)
    expect(eventLeadsInsert(calls)).toBeDefined()
    expect(usersInsert(calls)).toBeUndefined()
  })
})
