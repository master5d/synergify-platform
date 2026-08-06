import { describe, it, expect } from 'vitest'
import { getStats } from './stats'

function fakeDb(counts: { users: number; progress: number; intake: number }) {
  return {
    prepare(sql: string) {
      return {
        first: async () => {
          if (sql.includes('FROM users')) return { c: counts.users }
          if (sql.includes('FROM progress')) return { c: counts.progress }
          if (sql.includes('FROM intake_profiles')) return { c: counts.intake }
          return { c: 0 }
        },
      }
    },
  } as any
}

describe('getStats', () => {
  it('returns total/learners/intakeCompleted from D1 counts', async () => {
    const res = await getStats(fakeDb({ users: 10, progress: 6, intake: 4 }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ total: 10, learners: 6, intakeCompleted: 4 })
  })

  it('coerces missing rows to 0', async () => {
    const db = { prepare: () => ({ first: async () => null }) } as any
    expect(await (await getStats(db)).json()).toEqual({ total: 0, learners: 0, intakeCompleted: 0 })
  })

  it('counts learners as DISTINCT progress users (true students)', async () => {
    const sqls: string[] = []
    const db = { prepare: (s: string) => { sqls.push(s); return { first: async () => ({ c: 1 }) } } } as any
    await getStats(db)
    expect(sqls.some(s => /COUNT\(DISTINCT user_id\)\s+AS c FROM progress/i.test(s))).toBe(true)
  })
})
