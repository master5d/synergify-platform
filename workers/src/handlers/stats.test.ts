import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { getStats, compareLessonSlugs, STALL_DAYS } from './stats'
import { LAPSE_SEC } from '../lib/nudge-policy'

function fakeDb(counts: { users: number; progress: number; intake: number }) {
  return {
    prepare(sql: string) {
      const stmt = {
        bind: () => stmt,
        all: async () => ({ results: [] }),
        first: async () => {
          if (sql.includes('NOT EXISTS')) return { c: 0 }
          if (sql.includes('FROM users')) return { c: counts.users }
          if (sql.includes('FROM progress')) return { c: counts.progress }
          if (sql.includes('FROM intake_profiles')) return { c: counts.intake }
          return { c: 0 }
        },
      }
      return stmt
    },
  } as any
}

describe('getStats', () => {
  it('returns total/learners/intakeCompleted from D1 counts', async () => {
    const res = await getStats(fakeDb({ users: 10, progress: 6, intake: 4 }))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ total: 10, learners: 6, intakeCompleted: 4 })
  })

  it('coerces missing rows to 0', async () => {
    const stmt: any = { bind: () => stmt, first: async () => null, all: async () => ({ results: [] }) }
    const db = { prepare: () => stmt } as any
    expect(await (await getStats(db)).json())
      .toMatchObject({ total: 0, learners: 0, intakeCompleted: 0, notStarted: 0, funnel: {}, dropoff: [] })
  })

  it('counts learners as DISTINCT progress users (true students)', async () => {
    const sqls: string[] = []
    const stmt: any = { bind: () => stmt, first: async () => ({ c: 1 }), all: async () => ({ results: [] }) }
    const db = { prepare: (s: string) => { sqls.push(s); return stmt } } as any
    await getStats(db)
    expect(sqls.some(s => /COUNT\(DISTINCT user_id\)\s+AS c FROM progress/i.test(s))).toBe(true)
  })

  it('builds the funnel with one GROUP BY query, not per course/lesson', async () => {
    const sqls: string[] = []
    const stmt: any = { bind: () => stmt, first: async () => ({ c: 0 }), all: async () => ({ results: [] }) }
    const db = { prepare: (s: string) => { sqls.push(s); return stmt } } as any
    await getStats(db)
    expect(sqls.filter(s => /GROUP BY course, lesson_slug/.test(s))).toHaveLength(1)
    expect(sqls).toHaveLength(6) // 3 старых счётчика + notStarted + funnel + dropoff
  })
})

// --- D1-фикстура на настоящем SQLite: схема = все миграции по порядку ---------------

const MIGRATIONS = fileURLToPath(new URL('../../migrations/', import.meta.url))

function sqliteD1() {
  const db = new DatabaseSync(':memory:')
  for (const f of readdirSync(MIGRATIONS).filter(f => f.endsWith('.sql')).sort()) {
    db.exec(readFileSync(MIGRATIONS + f, 'utf8'))
  }
  const d1 = {
    prepare(sql: string) {
      let args: any[] = []
      const stmt = {
        bind: (...a: any[]) => { args = a; return stmt },
        first: async () => (db.prepare(sql).get(...args) as any) ?? null,
        all: async () => ({ results: db.prepare(sql).all(...args) as any[] }),
        run: async () => { db.prepare(sql).run(...args); return { success: true } },
      }
      return stmt
    },
  } as any
  return { db, d1 }
}

const NOW = 2_000_000_000
const DAY = 24 * 60 * 60
const OLD = NOW - (STALL_DAYS + 1) * DAY   // неактивен дольше порога
const FRESH = NOW - DAY                    // был вчера

function seed(db: DatabaseSync, users: string[], rows: [string, string, string, number, number | null][]) {
  for (const u of users) db.prepare('INSERT INTO users (id, email, created_at) VALUES (?, ?, 0)').run(u, `${u}@x.test`)
  for (const [user, course, slug, viewed, done] of rows) {
    db.prepare('INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES (?, ?, ?, ?, ?)')
      .run(user, slug, viewed, done, course)
  }
}

async function stats(d1: any) {
  return (await getStats(d1, NOW)).json() as Promise<any>
}

describe('getStats — funnel & dropoff on D1 (SQLite)', () => {
  it('empty base: zeros, empty funnel and dropoff', async () => {
    const { d1 } = sqliteD1()
    expect(await stats(d1)).toEqual({
      total: 0, learners: 0, intakeCompleted: 0, notStarted: 0, stallDays: STALL_DAYS, funnel: {}, dropoff: [],
    })
  })

  it('one course: reached/completed per lesson, dropoff at the last completed lesson', async () => {
    const { db, d1 } = sqliteD1()
    seed(db, ['a', 'b', 'c'], [
      ['a', 'c1', '00-start', OLD, OLD], ['a', 'c1', '01-next', OLD, OLD], ['a', 'c1', '02-end', OLD, null],
      ['b', 'c1', '00-start', OLD, OLD],
      ['c', 'c1', '00-start', FRESH, FRESH], ['c', 'c1', '01-next', FRESH, null],
    ])
    const s = await stats(d1)
    expect(s.learners).toBe(3)
    expect(s.funnel).toEqual({
      c1: [
        { module: '00-start', unit: null, reached: 3, completed: 3 },
        { module: '01-next', unit: null, reached: 2, completed: 1 },
        { module: '02-end', unit: null, reached: 1, completed: 0 },
      ],
    })
    // c активен — не в dropoff; a и b остановились на разных уроках.
    expect(s.dropoff).toEqual([
      { course: 'c1', module: '00-start', unit: null, stalled: 1 },
      { course: 'c1', module: '01-next', unit: null, stalled: 1 },
    ])
  })

  it('two courses: funnels are separate, dropoff ranked by stalled count', async () => {
    const { db, d1 } = sqliteD1()
    seed(db, ['a', 'b', 'c'], [
      ['a', 'c1', '00-start', OLD, OLD],
      ['b', 'c1', '00-start', OLD, OLD],
      ['c', 'c2', '01-m/u1-x', OLD, OLD], ['c', 'c2', '01-m/u2-y', OLD, null],
    ])
    const s = await stats(d1)
    expect(Object.keys(s.funnel)).toEqual(['c1', 'c2'])
    expect(s.funnel.c1).toEqual([{ module: '00-start', unit: null, reached: 2, completed: 2 }])
    expect(s.funnel.c2).toEqual([
      { module: '01-m', unit: 'u1-x', reached: 1, completed: 1 },
      { module: '01-m', unit: 'u2-y', reached: 1, completed: 0 },
    ])
    expect(s.dropoff).toEqual([
      { course: 'c1', module: '00-start', unit: null, stalled: 2 },
      { course: 'c2', module: '01-m', unit: 'u1-x', stalled: 1 },
    ])
  })

  it('learner without progress is counted separately; stalled-without-completions is a null bucket', async () => {
    const { db, d1 } = sqliteD1()
    seed(db, ['a', 'ghost', 'b'], [
      ['a', 'c1', '00-start', OLD, null],
      ['b', 'c1', '00-start', FRESH, null],
    ])
    const s = await stats(d1)
    expect(s.total).toBe(3)
    expect(s.learners).toBe(2)
    expect(s.notStarted).toBe(1)
    expect(s.funnel.c1).toEqual([{ module: '00-start', unit: null, reached: 2, completed: 0 }])
    expect(s.dropoff).toEqual([{ course: 'c1', module: null, unit: null, stalled: 1 }])
  })

  it('funnel follows course order, not insertion/alphabet (u10 after u2, module before its units, flat pages last)', async () => {
    const { db, d1 } = sqliteD1()
    const slugs = ['cheatsheet', '10-last', '02-m/u10-k', '02-m', '02-m/u2-b', '01-first', '02-m/u1-a']
    seed(db, ['a'], slugs.map(s => ['a', 'c1', s, FRESH, null] as [string, string, string, number, null]))
    const s = await stats(d1)
    expect(s.funnel.c1.map((r: any) => (r.unit ? `${r.module}/${r.unit}` : r.module))).toEqual([
      '01-first', '02-m', '02-m/u1-a', '02-m/u2-b', '02-m/u10-k', '10-last', 'cheatsheet',
    ])
  })

  it('stall threshold: activity after completion keeps the learner out of dropoff', async () => {
    const { db, d1 } = sqliteD1()
    seed(db, ['a'], [['a', 'c1', '00-start', OLD, OLD], ['a', 'c1', '01-next', FRESH, null]])
    expect((await stats(d1)).dropoff).toEqual([])
  })
})

describe('STALL_DAYS', () => {
  it('matches the nudge lapse window (one definition of «бросил»)', () => {
    expect(STALL_DAYS * DAY).toBe(LAPSE_SEC)
  })
})

// Порядок в воронке выводится из слагов; сверяем его с настоящим порядком каждого pack'а
// (module из _meta.json + массив units), чтобы расхождение нумерации ловилось здесь.
describe('compareLessonSlugs vs real course packs', () => {
  const PACKS = fileURLToPath(new URL('../../../LMS/tochka-sborki/web/packs/', import.meta.url))
  const packs = readdirSync(PACKS, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && existsSync(`${PACKS}${d.name}/content/ru`))
    .map(d => d.name)

  it('finds at least one pack', () => expect(packs.length).toBeGreaterThan(0))

  for (const pack of packs) {
    it(`${pack}: slug order == module number + _meta units order`, () => {
      const dir = `${PACKS}${pack}/content/ru/`
      const modules = readdirSync(dir, { withFileTypes: true })
        .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name))
        .map(e => ({ slug: e.name, meta: JSON.parse(readFileSync(`${dir}${e.name}/_meta.json`, 'utf8')) }))
        .sort((a, b) => a.meta.module - b.meta.module)
      const canonical = modules.flatMap(m => [m.slug, ...m.meta.units.map((u: { slug: string }) => `${m.slug}/${u.slug}`)])
      const shuffled = [...canonical].reverse()
      expect(shuffled.sort(compareLessonSlugs)).toEqual(canonical)
    })
  }
})
