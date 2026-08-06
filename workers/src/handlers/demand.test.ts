import { describe, it, expect } from 'vitest'
import { listBriefs, listSignals, decideBrief } from './demand'

// fake D1 that records the last SQL + bindings and returns canned rows
function fakeDb(rows: any[] = []) {
  const calls: { sql: string; binds: any[] }[] = []
  const db = {
    calls,
    prepare(sql: string) {
      return {
        bind(...binds: any[]) {
          calls.push({ sql, binds })
          return {
            all: async () => ({ results: rows }),
            first: async () => rows[0] ?? null,
            run: async () => ({ success: true }),
          }
        },
        all: async () => ({ results: rows }),
        first: async () => rows[0] ?? null,
        run: async () => ({ success: true }),
      }
    },
  } as any
  return db
}

describe('listBriefs', () => {
  it('parses proposal_json and returns 200', async () => {
    const db = fakeDb([{ id: 'b1', gap_topic_key: 'x', status: 'open', signal_count: 3,
      proposal_json: JSON.stringify({ title: { ru: 'Т', en: 'T' } }), created_at: 1, decided_at: null }])
    const res = await listBriefs(db, 'open')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body[0].proposal.title.en).toBe('T')
  })
})

describe('decideBrief', () => {
  it('rejects an invalid status', async () => {
    const res = await decideBrief(fakeDb(), 'b1', 'bogus')
    expect(res.status).toBe(400)
  })
  it('accepts a valid status', async () => {
    const db = fakeDb()
    const res = await decideBrief(db, 'b1', 'accepted')
    expect(res.status).toBe(200)
    expect(db.calls.some((c: any) => c.binds.includes('accepted') && c.binds.includes('b1'))).toBe(true)
  })
})

describe('listSignals', () => {
  it('returns 200 with rows', async () => {
    const db = fakeDb([{ gap_topic_key: 'x', n: 4 }])
    const res = await listSignals(db)
    expect(res.status).toBe(200)
  })
})
import { runDemandRadar } from './demand'
import { vi } from 'vitest'

function geminiResp(jsonText: string) {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: jsonText }] } }] }) }
}

// fake D1 that tracks inserts into both tables and answers COUNT/open-brief queries
function radarDb() {
  const inserts: { table: string; binds: any[] }[] = []
  let openBrief: any = null
  const db = {
    inserts,
    prepare(sql: string) {
      return {
        bind(...binds: any[]) {
          return {
            run: async () => {
              if (sql.includes('INSERT INTO content_demand_signals')) inserts.push({ table: 'signals', binds })
              if (sql.includes('INSERT INTO content_demand_briefs')) { inserts.push({ table: 'briefs', binds }); openBrief = { id: binds[0] } }
              return { success: true }
            },
            first: async () => {
              if (sql.includes("status='open'")) return openBrief
              if (sql.includes('COUNT(*)')) return { n: 1 }
              return null
            },
            all: async () => ({ results: [{ raw_text: 'bot that books my clients' }] }),
          }
        },
      }
    },
  } as any
  return db
}

describe('runDemandRadar', () => {
  it('inserts a signal and raises a brief for a high-value gap', async () => {
    const db = radarDb()
    const fetchImpl = vi.fn().mockResolvedValue(geminiResp(JSON.stringify([
      { classification: 'gap', matched_module: null, gap_topic_key: 'telegram-intake-bot',
        gap_topic_label: { ru: 'Бот заявок', en: 'Intake bot' }, feasibility_note: null, value_tier: 'high' },
    ])))
    const env = { DB: db, GEMINI_API_KEY: 'k' } as any
    await runDemandRadar(env, 'u1', { F3: 'bot that books my clients', F5: 'yes' }, fetchImpl as any)
    expect(db.inserts.some((i: any) => i.table === 'signals')).toBe(true)
    expect(db.inserts.some((i: any) => i.table === 'briefs')).toBe(true)
  })

  it('does nothing when there are no demand signals', async () => {
    const db = radarDb()
    const fetchImpl = vi.fn()
    const env = { DB: db, GEMINI_API_KEY: 'k' } as any
    await runDemandRadar(env, 'u1', { F1: 'solo' }, fetchImpl as any)
    expect(db.inserts).toHaveLength(0)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
