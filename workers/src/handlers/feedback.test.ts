import { describe, it, expect } from 'vitest'
import { handleFeedback } from './feedback'
import type { Env } from '../lib/types'

type DbCall = { sql: string; binds: unknown[] }

function makeEnv(opts: { calls?: DbCall[] } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return { run: async () => ({ success: true }) }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    WORKER_JWT_SECRET: 'test-secret',
  } as Env
}

function req(body: unknown) {
  return new Request('https://ai.synergify.com/api/feedback', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const feedbackInsert = (calls: DbCall[]) => calls.find(c => /INSERT INTO course_feedback/.test(c.sql))

describe('handleFeedback', () => {
  it('returns 400 and writes nothing when lesson is missing', async () => {
    const calls: DbCall[] = []
    const res = await handleFeedback(req({ recommend: '5' }), makeEnv({ calls }))
    expect(res.status).toBe(400)
    expect(feedbackInsert(calls)).toBeUndefined()
  })

  it('persists a full payload to course_feedback and returns 200', async () => {
    const calls: DbCall[] = []
    const res = await handleFeedback(
      req({ lesson: '01-introduction', recommend: '5', impact: '4', apply: '5', unclear: 'x', other: 'y', locale: 'ru' }),
      makeEnv({ calls }),
    )
    expect(res.status).toBe(200)
    const ins = feedbackInsert(calls)
    expect(ins).toBeDefined()
    expect(ins!.binds).toContain('01-introduction')
  })

  it('persists a skippable (lesson-only) payload and returns 200', async () => {
    const calls: DbCall[] = []
    const res = await handleFeedback(req({ lesson: '01-introduction' }), makeEnv({ calls }))
    expect(res.status).toBe(200)
    expect(feedbackInsert(calls)).toBeDefined()
  })
})
