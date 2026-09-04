import { describe, it, expect, vi } from 'vitest'
import { handleProgress, handleMe, handleSubmit } from './intake'
import type { LlmEnv } from '../lib/llm-client'

// Фикс-раунд 1 (координатор): раньше здесь стояла строка 'key' четвёртым параметром
// и vi.fn() без реализации — handleSubmit ждёт LlmEnv, а callLlm на пустом vi.fn()
// падает синхронно (await undefined → undefined.ok), так что тест случайно ехал по
// пути catch/fallback, а не по пути успеха, который якобы проверял.
const LLM_ENV: LlmEnv = { LLM_SERVICE_URL: 'https://x', LLM_SERVICE_TOKEN: 't',
  LLM_CF_ACCESS_CLIENT_ID: 'i', LLM_CF_ACCESS_CLIENT_SECRET: 's' }

function okFetch() {
  return vi.fn().mockResolvedValue({ ok: true, status: 200,
    json: async () => ({ legendaryTitle: 'T', backstory: 'B', firstQuest: 'F', finalBoss: 'X' }) })
}

function fakeDb(row: any = null) {
  const store = { row }
  return {
    prepare: () => ({
      bind: (..._a: any[]) => ({
        first: async () => store.row,
        run: async () => { store.row = { ...(store.row ?? {}) }; return { success: true } },
      }),
    }),
    _store: store,
  } as any
}

describe('handleMe', () => {
  it('returns 404 when no profile', async () => {
    const res = await handleMe(fakeDb(null), 'user1')
    expect(res.status).toBe(404)
  })
  it('returns profile when present', async () => {
    const res = await handleMe(fakeDb({ user_id: 'user1', status: 'completed' }), 'user1')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('completed')
  })
})

describe('handleSubmit', () => {
  it('rejects missing required answers', async () => {
    const res = await handleSubmit(fakeDb(), 'user1', { answers: {} }, LLM_ENV, okFetch() as any)
    expect(res.status).toBe(400)
  })
})

function fakeDbV2() {
  const rows: Record<string, any> = {}
  return {
    _rows: rows,
    prepare(sql: string) {
      const binds: any[] = []
      const stmt: any = {
        bind: (...a: any[]) => { binds.push(...a); return stmt },
        first: async () => rows['user1'] ?? null,
        run: async () => {
          if (sql.startsWith('INSERT INTO intake_profiles')) {
            const uid = binds[0]
            const prev = rows[uid] ?? {}
            // progress insert binds: (uid, version, answers, step, now, now)
            if (sql.includes('current_step, created_at')) {
              rows[uid] = { user_id: uid, instrument_version: prev.instrument_version ?? binds[1], answers: binds[2], current_step: binds[3] }
            }
          }
          return { success: true }
        },
      }
      return stmt
    },
  } as any
}

describe('versioning', () => {
  it('progress stamps version on first write and freezes it', async () => {
    const db = fakeDbV2()
    await handleProgress(db, 'user1', { answers: { V_WHY: 'project' }, currentStep: 1, instrumentVersion: 2 })
    expect(db._rows['user1'].instrument_version).toBe(2)
    // a later write claiming v1 must not flip it
    await handleProgress(db, 'user1', { answers: { V_WHY: 'project' }, currentStep: 2, instrumentVersion: 1 })
    expect(db._rows['user1'].instrument_version).toBe(2)
  })
  it('v2 submit accepts empty required and scores via v2', async () => {
    const db = fakeDbV2()
    db._rows['user1'] = { user_id: 'user1', instrument_version: 2, current_step: 5, answers: '{}' }
    const res = await handleSubmit(db, 'user1', { answers: { V_NICHE: 'coach', V_SKIN: 'cyber-noir' } }, LLM_ENV, okFetch() as any)
    expect(res.status).toBe(200)
  })
})
