# S.A.S.H.A S4 — Admission Mechanic + Course-Keying Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server-verified academy admission (completion → real admission record) + additive course-keying of learner data, with the golden-ticket page requesting the grant fire-and-forget.

**Architecture:** New additive migration (admissions table + defaulted `course` columns). New `handlers/academy.ts` with `handleAdmission` (verifies completed progress covers all 9 `COURSE_CATALOG` module slugs; INSERT OR IGNORE grant; idempotent) and `handleAcademyMe` (unified profile: admissions + per-course progress summary). Progress handlers accept optional `course` (default `'tochka-sborki'`). LMS certificate page fires the admission request without touching its render path.

**Tech Stack:** Cloudflare Workers + D1 (workers/), Vitest with mocked D1, Next.js LMS app (one client component touch).

## Global Constraints

- Apps touched: `workers/` (main), `LMS/tochka-sborki/web` (certificate wiring; dir spelled `tochka-sborki`, NO second "s"), `LMS/_template/CHECKLIST.md` (one line).
- All git from repo root `C:\telo\Efforts\Ongoing\mc_hub`. Commit directly to main (trunk-based).
- Migration is ADDITIVE ONLY (new table + `ADD COLUMN … DEFAULT`); no PK rebuilds, no data rewrites. Applying it to prod D1 is an OPS step after ship (cloudflare-api MCP `/query`) — NOT part of these commits.
- No new dependencies. Progress API stays backward-compatible: requests without `course` behave exactly as today.
- Certificate page must render identically when the admission call fails/401/403 (fire-and-forget with `.catch(() => {})`).
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: Migration 0014 + academy handlers + routes (TDD)

**Files:**
- Create: `workers/migrations/0014_academy.sql`
- Create: `workers/src/handlers/academy.ts`
- Modify: `workers/src/index.ts` (one import + two route branches)
- Test: `workers/src/handlers/academy.test.ts`

**Interfaces:**
- Consumes: `requireAuth(request, env)` → `Response | { sub, email }` from `../middleware`; `COURSE_CATALOG` from `../lib/course-catalog`; `env.DB` (D1).
- Produces: `handleAdmission(request, env)`, `handleAcademyMe(request, env)`; routes `POST /api/academy/admission`, `GET /api/academy/me`. Task 3's LMS wiring calls the admission route.

- [ ] **Step 1: Create `workers/migrations/0014_academy.sql`:**

```sql
-- workers/migrations/0014_academy.sql
-- S.A.S.H.A S4: admissions + additive course-keying (fb_97517f307a46).
CREATE TABLE IF NOT EXISTS admissions (
  user_id    TEXT NOT NULL REFERENCES users(id),
  course     TEXT NOT NULL,
  granted_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, course)
);

ALTER TABLE progress ADD COLUMN course TEXT NOT NULL DEFAULT 'tochka-sborki';
ALTER TABLE intake_profiles ADD COLUMN course TEXT NOT NULL DEFAULT 'tochka-sborki';
```

- [ ] **Step 2: Write the failing tests** — `workers/src/handlers/academy.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { handleAdmission, handleAcademyMe } from './academy'
import { COURSE_CATALOG } from '../lib/course-catalog'
import type { Env } from '../lib/types'
import { signJWT } from '../lib/jwt'

const SECRET = 'test-secret-32-characters-minimum!!'

async function makeAuthRequest(url: string, method: string): Promise<Request> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = await signJWT({ sub: 'user1', email: 'a@b.com', iat: now, exp: now + 3600 }, SECRET)
  return new Request(url, { method, headers: { 'Cookie': `session=${jwt}` } })
}

interface MockData {
  completedSlugs?: string[]
  admissionRow?: { granted_at: number } | null
  admissions?: { course: string; granted_at: number }[]
  courses?: { course: string; viewed: number; completed: number }[]
}

function makeEnv(data: MockData = {}) {
  const run = vi.fn().mockResolvedValue({ success: true })
  const env = {
    DB: {
      prepare: (sql: string) => ({
        bind: (..._args: unknown[]) => ({
          run,
          first: vi.fn().mockResolvedValue(data.admissionRow ?? null),
          all: vi.fn().mockImplementation(async () => {
            if (sql.includes('GROUP BY course')) return { results: data.courses ?? [] }
            if (sql.includes('FROM admissions')) return { results: data.admissions ?? [] }
            if (sql.includes('FROM progress')) {
              return { results: (data.completedSlugs ?? []).map(s => ({ lesson_slug: s })) }
            }
            return { results: [] }
          }),
        }),
      }),
    } as unknown as D1Database,
    WORKER_JWT_SECRET: SECRET,
    RESEND_API_KEY: '',
  } as unknown as Env
  return { env, run }
}

const ALL_SLUGS = COURSE_CATALOG.map(m => m.slug)

describe('handleAdmission', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('https://ai.mamaev.coach/api/academy/admission', { method: 'POST' })
    const { env } = makeEnv()
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(401)
  })

  it('returns 403 with the missing module list when incomplete', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/academy/admission', 'POST')
    const { env, run } = makeEnv({ completedSlugs: ['00-kickstart'] })
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(403)
    const body = await res.json() as { missing: string[] }
    expect(body.missing).toHaveLength(ALL_SLUGS.length - 1)
    expect(body.missing).toContain('01-introduction')
    expect(run).not.toHaveBeenCalled()
  })

  it('grants when completed progress covers every catalog module', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/academy/admission', 'POST')
    const { env, run } = makeEnv({ completedSlugs: ALL_SLUGS, admissionRow: { granted_at: 12345 } })
    const res = await handleAdmission(req, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { granted: boolean; course: string; granted_at: number }
    expect(body.granted).toBe(true)
    expect(body.course).toBe('tochka-sborki')
    expect(body.granted_at).toBe(12345) // read back — idempotent repeat returns the ORIGINAL grant time
    expect(run).toHaveBeenCalled() // INSERT OR IGNORE issued
  })
})

describe('handleAcademyMe', () => {
  it('returns 401 without auth', async () => {
    const req = new Request('https://ai.mamaev.coach/api/academy/me')
    const { env } = makeEnv()
    const res = await handleAcademyMe(req, env)
    expect(res.status).toBe(401)
  })

  it('returns the unified profile shape', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/academy/me', 'GET')
    const { env } = makeEnv({
      admissions: [{ course: 'tochka-sborki', granted_at: 111 }],
      courses: [{ course: 'tochka-sborki', viewed: 12, completed: 9 }],
    })
    const res = await handleAcademyMe(req, env)
    expect(res.status).toBe(200)
    const body = await res.json() as { email: string; admissions: unknown[]; courses: unknown[] }
    expect(body.email).toBe('a@b.com')
    expect(body.admissions).toEqual([{ course: 'tochka-sborki', granted_at: 111 }])
    expect(body.courses).toEqual([{ course: 'tochka-sborki', viewed: 12, completed: 9 }])
  })
})
```

- [ ] **Step 3: Run to verify they fail**

Run (from `workers/`): `npx vitest run src/handlers/academy.test.ts`
Expected: FAIL — cannot resolve `./academy`.

- [ ] **Step 4: Create `workers/src/handlers/academy.ts`:**

```ts
import type { Env } from '../lib/types'
import { requireAuth } from '../middleware'
import { COURSE_CATALOG } from '../lib/course-catalog'

const COURSE = 'tochka-sborki'

/** POST /api/academy/admission — server-verified grant: completed progress must
 *  cover every COURSE_CATALOG module slug. Idempotent (INSERT OR IGNORE). */
export async function handleAdmission(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  const { results } = await env.DB.prepare(
    'SELECT lesson_slug FROM progress WHERE user_id = ? AND completed_at IS NOT NULL'
  ).bind(auth.sub).all<{ lesson_slug: string }>()

  const completed = new Set(results.map(r => r.lesson_slug))
  const missing = COURSE_CATALOG.map(m => m.slug).filter(slug => !completed.has(slug))
  if (missing.length > 0) {
    return Response.json({ error: 'course incomplete', missing }, { status: 403 })
  }

  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare(
    'INSERT OR IGNORE INTO admissions (user_id, course, granted_at) VALUES (?, ?, ?)'
  ).bind(auth.sub, COURSE, now).run()

  const row = await env.DB.prepare(
    'SELECT granted_at FROM admissions WHERE user_id = ? AND course = ?'
  ).bind(auth.sub, COURSE).first<{ granted_at: number }>()

  return Response.json({ granted: true, course: COURSE, granted_at: row?.granted_at ?? now })
}

/** GET /api/academy/me — unified academy profile: admissions + per-course progress summary. */
export async function handleAcademyMe(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) return auth

  const admissions = await env.DB.prepare(
    'SELECT course, granted_at FROM admissions WHERE user_id = ?'
  ).bind(auth.sub).all<{ course: string; granted_at: number }>()

  const courses = await env.DB.prepare(
    `SELECT course, COUNT(*) AS viewed,
            SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed
     FROM progress WHERE user_id = ? GROUP BY course`
  ).bind(auth.sub).all<{ course: string; viewed: number; completed: number }>()

  return Response.json({ email: auth.email, admissions: admissions.results, courses: courses.results })
}
```

- [ ] **Step 5: Wire the routes.** In `workers/src/index.ts`:

(a) Add to the handler imports (after the `handleAlumniList…` import line):
```ts
import { handleAdmission, handleAcademyMe } from './handlers/academy'
```

(b) In the route if-chain, directly after the `/api/alumni/optin` branch (`} else if (path === '/api/alumni/optin' && method === 'POST') { … }`), insert:
```ts
      } else if (path === '/api/academy/admission' && method === 'POST') {
        response = await handleAdmission(request, env)
      } else if (path === '/api/academy/me' && method === 'GET') {
        response = await handleAcademyMe(request, env)
```

- [ ] **Step 6: Run to verify they pass**

Run (from `workers/`): `npx vitest run src/handlers/academy.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Gates**

Run (from `workers/`): `npx tsc --noEmit` — expected exit 0.
Run (from `workers/`): `npx wrangler deploy --dry-run` — expected: bundle succeeds (catches esbuild/import breaks).

- [ ] **Step 8: Commit** (from repo root)

```bash
git add workers/migrations/0014_academy.sql workers/src/handlers/academy.ts workers/src/handlers/academy.test.ts workers/src/index.ts
git commit -m "feat(workers): S4 admissions table + server-verified academy admission API (fb_97517f307a46)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Course param in progress handlers (TDD, backward-compatible)

**Files:**
- Modify: `workers/src/handlers/progress.ts`
- Test: `workers/src/handlers/progress.test.ts` (append one describe block)

**Interfaces:**
- Consumes: existing `handleView`/`handleComplete`/`handleList`.
- Produces: same handlers accepting optional `course?: string` (default `'tochka-sborki'`); `handleList` rows gain a `course` field. No caller changes required.

- [ ] **Step 1: Append the failing tests** to `workers/src/handlers/progress.test.ts` (uses the file's existing `makeAuthRequest` + `SECRET`; add this self-contained capture-env helper and describe block at the end):

```ts
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
    RESEND_API_KEY: '',
  } as unknown as Env
  return { env, calls }
}

describe('course keying (S4)', () => {
  it('view defaults course to tochka-sborki', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/progress/view', 'POST', { lesson_slug: '01-introduction' })
    const { env, calls } = makeCaptureEnv()
    const res = await handleView(req, env)
    expect(res.status).toBe(200)
    expect(calls[0]).toContain('tochka-sborki')
  })

  it('view passes an explicit course through', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/progress/view', 'POST', { lesson_slug: 'x/u1-intro', course: 'x' })
    const { env, calls } = makeCaptureEnv()
    await handleView(req, env)
    expect(calls[0]).toContain('x')
    expect(calls[0]).not.toContain('tochka-sborki')
  })

  it('complete defaults course to tochka-sborki', async () => {
    const req = await makeAuthRequest('https://ai.mamaev.coach/api/progress/complete', 'POST', { lesson_slug: '01-introduction' })
    const { env, calls } = makeCaptureEnv()
    const res = await handleComplete(req, env)
    expect(res.status).toBe(200)
    expect(calls[0]).toContain('tochka-sborki')
  })
})
```

- [ ] **Step 2: Run to verify the new tests fail**

Run (from `workers/`): `npx vitest run src/handlers/progress.test.ts`
Expected: the three new tests FAIL (bind args contain no course value yet); pre-existing tests still pass.

- [ ] **Step 3: Update `workers/src/handlers/progress.ts`.**

In `handleView`: body type becomes `{ lesson_slug?: string; course?: string }`; after the `lesson_slug` guard add `const course = body.course ?? 'tochka-sborki'`; SQL/bind become:
```ts
  await env.DB.prepare(
    'INSERT OR IGNORE INTO progress (user_id, lesson_slug, viewed_at, course) VALUES (?, ?, ?, ?)'
  ).bind(auth.sub, body.lesson_slug, now, course).run()
```

In `handleComplete`: same body type + `const course = body.course ?? 'tochka-sborki'`; SQL/bind become (conflict update unchanged — an existing row keeps its original course):
```ts
  await env.DB.prepare(`
    INSERT INTO progress (user_id, lesson_slug, viewed_at, completed_at, course) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (user_id, lesson_slug) DO UPDATE SET completed_at = excluded.completed_at
  `).bind(auth.sub, body.lesson_slug, now, now, course).run()
```

In `handleList`: the SELECT gains `course`:
```ts
  const { results } = await env.DB.prepare(
    'SELECT lesson_slug, viewed_at, completed_at, course FROM progress WHERE user_id = ?'
  ).bind(auth.sub).all<{ lesson_slug: string; viewed_at: number; completed_at: number | null; course: string }>()
```

- [ ] **Step 4: Run to verify all pass**

Run (from `workers/`): `npx vitest run src/handlers/progress.test.ts`
Expected: PASS (existing + 3 new).

- [ ] **Step 5: Gates**

Run (from `workers/`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add workers/src/handlers/progress.ts workers/src/handlers/progress.test.ts
git commit -m "feat(workers): S4 optional course param on progress API, default tochka-sborki (fb_97517f307a46)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Certificate wiring + convention doc + full gates (TDD)

**Files:**
- Modify: `LMS/tochka-sborki/web/components/pages/certificate-page.tsx` (one useEffect)
- Modify: `LMS/tochka-sborki/web/lib/course/certificate.ts` (comment only)
- Modify: `LMS/_template/CHECKLIST.md` (one checkbox)
- Test: `LMS/tochka-sborki/web/components/pages/certificate-page.test.ts`

**Interfaces:**
- Consumes: `POST /api/academy/admission` (Task 1).
- Produces: nothing new — wiring + docs.

- [ ] **Step 1: Write the failing drift-guard test** — `LMS/tochka-sborki/web/components/pages/certificate-page.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'certificate-page.tsx'), 'utf8')
const certData = readFileSync(join(HERE, '..', '..', 'lib', 'course', 'certificate.ts'), 'utf8')

describe('certificate page — academy admission wiring (S4)', () => {
  it('requests the admission fire-and-forget', () => {
    expect(src).toContain("/api/academy/admission")
    expect(src).toContain("credentials: 'include'")
    expect(src).toMatch(/\.catch\(\(\) => \{\}\)/)
  })

  it('certificate data no longer claims the ticket is symbolic', () => {
    expect(certData).not.toMatch(/SYMBOLIC/i)
    expect(certData).toContain('granted server-side')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/pages/certificate-page.test.ts`
Expected: FAIL (admission call absent; SYMBOLIC comment present).

- [ ] **Step 3: Wire the certificate page.** In `LMS/tochka-sborki/web/components/pages/certificate-page.tsx`, directly after the name-persist effect (the block ending `}, [name])`), insert:

```ts
  // S4 (fb_97517f307a46): request the academy admission fire-and-forget — the
  // server verifies completion; the ticket renders the same either way.
  useEffect(() => {
    fetch('/api/academy/admission', { method: 'POST', credentials: 'include' }).catch(() => {})
  }, [])
```

- [ ] **Step 4: Update the comment** in `LMS/tochka-sborki/web/lib/course/certificate.ts` — replace the line:
```
// Framing is SYMBOLIC — no promise of access to the (unbuilt) S.A.S.H.A academy.
```
with:
```
// Admission is granted server-side on verified completion (S4, fb_97517f307a46);
// the certificate page requests it fire-and-forget.
```

- [ ] **Step 5: Add the convention checkbox** to `LMS/_template/CHECKLIST.md`, at the end of section `## 1. Identity — web/lib/course.ts` (after the registry checkbox added in S1):

```markdown
- [ ] Progress API: send your `course` slug in `/api/progress/*` bodies and namespace lesson slugs (e.g. `<course>/<lesson>`) — the `progress` PK is `(user_id, lesson_slug)` without course, so bare-slug collisions across courses are prevented by convention.
```

- [ ] **Step 6: Full gates**

Run (from `LMS/tochka-sborki/web`): `npx vitest run` — expected: 99 test files pass (98 + 1 new).
Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0.
Run (from `workers/`): `npx vitest run` — expected: all files pass (re-check after Tasks 1–2).

- [ ] **Step 7: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/components/pages/certificate-page.tsx LMS/tochka-sborki/web/components/pages/certificate-page.test.ts LMS/tochka-sborki/web/lib/course/certificate.ts LMS/_template/CHECKLIST.md
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S4 certificate requests real admission + future-course convention (fb_97517f307a46)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
