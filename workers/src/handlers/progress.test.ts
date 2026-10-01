import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleView, handleComplete, handleList } from './progress'
import type { Env } from '../lib/types'
import { signJWT } from '../lib/jwt'

const SECRET = 'test-secret-32-characters-minimum!!'

async function makeAuthRequest(url: string, method: string, body: unknown): Promise<Request> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJWT({ sub: 'user1', email: 'a@b.com', iat: now, exp: now + 3600 }, SECRET)
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session=${jwt}`,
    },
  })
}

function makeEnv(): Env {
  const run = vi.fn().mockResolvedValue({ success: true })
  const all = vi.fn().mockResolvedValue({ results: [] })
  return {
    DB: {
      prepare: (_sql: string) => ({
        bind: (..._args: unknown[]) => ({ run, all, first: vi.fn().mockResolvedValue(null) }),
      }),
    } as unknown as D1Database,
    WORKER_JWT_SECRET: SECRET,
  }
}

describe('handleView', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('https://ai.synergify.com/api/progress/view', {
      method: 'POST',
      body: JSON.stringify({ lesson_slug: '01-introduction' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await handleView(req, makeEnv())
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid auth and lesson_slug', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/view', 'POST', { lesson_slug: '01-introduction' })
    const res = await handleView(req, makeEnv())
    expect(res.status).toBe(200)
  })
})

describe('handleComplete', () => {
  it('returns 200 with valid auth and lesson_slug', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/complete', 'POST', { lesson_slug: '01-introduction' })
    const res = await handleComplete(req, makeEnv())
    expect(res.status).toBe(200)
  })
})

describe('handleList', () => {
  it('returns 200 with empty array when no progress', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/list', 'GET', null)
    const res = await handleList(req, makeEnv())
    expect(res.status).toBe(200)
    const data = await res.json() as unknown[]
    expect(Array.isArray(data)).toBe(true)
  })
})

function makeCaptureEnv() {
  const calls: unknown[][] = []
  const run = vi.fn().mockResolvedValue({ success: true })
  const env = {
    DB: {
      prepare: (_sql: string) => ({
        bind: (...args: unknown[]) => {
          calls.push(args)
          return { run, all: vi.fn().mockResolvedValue({ results: [] }), first: vi.fn().mockResolvedValue(null) }
        },
      }),
    } as unknown as D1Database,
    WORKER_JWT_SECRET: SECRET,
  } as unknown as Env
  return { env, calls }
}

describe('course keying (S4)', () => {
  it('view defaults course to tochka-sborki', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/view', 'POST', { lesson_slug: '01-introduction' })
    const { env, calls } = makeCaptureEnv()
    const res = await handleView(req, env)
    expect(res.status).toBe(200)
    expect(calls[0]).toContain('tochka-sborki')
  })

  it('view passes an explicit course through', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/view', 'POST', { lesson_slug: 'x/u1-intro', course: 'x' })
    const { env, calls } = makeCaptureEnv()
    await handleView(req, env)
    expect(calls[0]).toContain('x')
    expect(calls[0]).not.toContain('tochka-sborki')
  })

  it('complete defaults course to tochka-sborki', async () => {
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/complete', 'POST', { lesson_slug: '01-introduction' })
    const { env, calls } = makeCaptureEnv()
    const res = await handleComplete(req, env)
    expect(res.status).toBe(200)
    expect(calls[0]).toContain('tochka-sborki')
  })
})

// ── События прогресса → Listmonk (intake LMS#3) ──────────────────────────────
// SQL-осведомлённый фейк D1: прогресс и журнал progress_events живут в памяти.
function makeEventsDb() {
  const progress = new Map<string, number | null>()   // lesson_slug → completed_at
  const events = new Set<string>()
  const db = {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: vi.fn(async () => {
          if (sql.includes('INSERT INTO progress')) {
            progress.set(args[1] as string, args[3] as number)
            return { success: true, meta: { changes: 1 } }
          }
          if (sql.includes('INSERT OR IGNORE INTO progress_events')) {
            const key = args.slice(0, 4).join('|')
            if (events.has(key)) return { success: true, meta: { changes: 0 } }
            events.add(key)
            return { success: true, meta: { changes: 1 } }
          }
          if (sql.includes('DELETE FROM progress_events')) {
            events.delete(args.join('|'))
            return { success: true, meta: { changes: 1 } }
          }
          return { success: true, meta: { changes: 0 } }
        }),
        all: vi.fn(async () => ({
          results: sql.includes('FROM progress WHERE')
            ? [...progress].filter(([, c]) => c).map(([lesson_slug]) => ({ lesson_slug }))
            : [],
        })),
        first: vi.fn().mockResolvedValue(null),
      }),
    }),
  }
  return { db: db as unknown as D1Database, progress, events }
}

const OUTLINE = { 'm1': ['u1', 'u2'], 'm2': ['u1'] }

function eventsEnv(db: D1Database, over: Record<string, string> = {}): Env {
  return {
    DB: db,
    WORKER_JWT_SECRET: SECRET,
    LISTMONK_URL: 'https://listmonk.test',
    LISTMONK_API_USER: 'api',
    LISTMONK_API_TOKEN: 'tok',
    CF_ACCESS_CLIENT_ID: 'cf-id',
    CF_ACCESS_CLIENT_SECRET: 'cf-secret',
    PROGRESS_EVENTS_ENABLED: '1',
    LISTMONK_PROGRESS_LIST_ID: '9',
    ...over,
  } as unknown as Env
}

// Listmonk: подписчика ещё нет (lookup пуст) → POST создаёт.
function mockListmonk(createStatus = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input)
    if (!init?.method || init.method === 'GET') {
      return Response.json({ data: { results: [] } })
    }
    return new Response('{}', { status: url.endsWith('/api/subscribers') ? createStatus : 200 })
  })
}

async function complete(env: Env, lesson_slug: string, outline: unknown = OUTLINE) {
  const req = await makeAuthRequest('https://ai.synergify.com/api/progress/complete', 'POST', { lesson_slug, course: 'demo', outline })
  return handleComplete(req, env)
}

describe('handleComplete → progress events', () => {
  afterEach(() => vi.restoreAllMocks())

  it('disabled by default: no Listmonk call, one log line, 200', async () => {
    const fetchMock = mockListmonk()
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { db } = makeEventsDb()
    const env = eventsEnv(db, { PROGRESS_EVENTS_ENABLED: '0' })
    await complete(env, 'm1/u1')
    const res = await complete(env, 'm1/u2')
    expect(res.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledTimes(2)   // по строке на вызов
    expect(String(log.mock.calls[0][0])).toContain('disabled')
  })

  it('enabled but list id empty: no Listmonk call', async () => {
    const fetchMock = mockListmonk()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { db } = makeEventsDb()
    const env = eventsEnv(db, { LISTMONK_PROGRESS_LIST_ID: '' })
    await complete(env, 'm1/u1')
    await complete(env, 'm1/u2')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('not the last unit of a module: no Listmonk call', async () => {
    const fetchMock = mockListmonk()
    const { db } = makeEventsDb()
    const res = await complete(eventsEnv(db), 'm1/u1')
    expect(res.status).toBe(200)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('last unit of a module: subscriber into the progress list with completed_modules', async () => {
    const fetchMock = mockListmonk()
    const { db, events } = makeEventsDb()
    const env = eventsEnv(db)
    await complete(env, 'm1/u1')
    const res = await complete(env, 'm1/u2')
    expect(res.status).toBe(200)
    const post = fetchMock.mock.calls.find(([, i]) => i?.method === 'POST')!
    expect(String(post[0])).toBe('https://listmonk.test/api/subscribers')
    expect((post[1] as any).headers.Authorization).toBe('token api:tok')
    expect(JSON.parse((post[1] as any).body)).toMatchObject({
      email: 'a@b.com',
      lists: [9],
      attribs: { completed_modules: ['demo/m1'], completed_course: [] },
    })
    // кампаний воркер не шлёт — только /api/subscribers
    expect(fetchMock.mock.calls.every(([u]) => String(u).includes('/api/subscribers'))).toBe(true)
    expect(events.has('user1|demo|module|m1')).toBe(true)
  })

  it('last unit of the course: completed_course is set', async () => {
    const fetchMock = mockListmonk()
    const { db, progress } = makeEventsDb()
    progress.set('m1/u1', 1); progress.set('m1/u2', 1)
    await complete(eventsEnv(db), 'm2/u1')
    const post = fetchMock.mock.calls.find(([, i]) => i?.method === 'POST')!
    expect(JSON.parse((post[1] as any).body).attribs).toEqual({
      completed_modules: ['demo/m1', 'demo/m2'],
      completed_course: ['demo'],
    })
  })

  it('repeat completion does not duplicate the event', async () => {
    const fetchMock = mockListmonk()
    const { db } = makeEventsDb()
    const env = eventsEnv(db)
    await complete(env, 'm1/u1')
    await complete(env, 'm1/u2')
    const calls = fetchMock.mock.calls.length
    expect(calls).toBeGreaterThan(0)
    await complete(env, 'm1/u2')
    await complete(env, 'm1/u1')
    expect(fetchMock.mock.calls.length).toBe(calls)
  })

  it('Listmonk error: still 200, error logged, claim released for a retry', async () => {
    mockListmonk(500)
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db, events } = makeEventsDb()
    const env = eventsEnv(db)
    await complete(env, 'm1/u1')
    const res = await complete(env, 'm1/u2')
    expect(res.status).toBe(200)
    expect(err).toHaveBeenCalled()
    expect(events.size).toBe(0)
  })

  it('Listmonk unreachable (fetch rejects): still 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { db } = makeEventsDb()
    const env = eventsEnv(db)
    await complete(env, 'm1/u1')
    const res = await complete(env, 'm1/u2')
    expect(res.status).toBe(200)
  })

  it('garbage outline: progress is recorded, no event', async () => {
    const fetchMock = mockListmonk()
    const { db, progress } = makeEventsDb()
    progress.set('m1/u1', 1)
    const res = await complete(eventsEnv(db), 'm1/u2', { m1: 'nope' })
    expect(res.status).toBe(200)
    expect(progress.get('m1/u2')).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('uses ctx.waitUntil when a context is given', async () => {
    mockListmonk()
    const { db, progress } = makeEventsDb()
    progress.set('m1/u1', 1)
    const waitUntil = vi.fn()
    const req = await makeAuthRequest('https://ai.synergify.com/api/progress/complete', 'POST', { lesson_slug: 'm1/u2', course: 'demo', outline: OUTLINE })
    const res = await handleComplete(req, eventsEnv(db), { waitUntil } as unknown as ExecutionContext)
    expect(res.status).toBe(200)
    expect(waitUntil).toHaveBeenCalledTimes(1)
    await waitUntil.mock.calls[0][0]
  })
})
