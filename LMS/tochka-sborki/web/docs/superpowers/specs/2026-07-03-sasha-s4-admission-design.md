# S.A.S.H.A — S4: server-side admission mechanic + additive course-keying (fb_97517f307a46)

**Ticket:** `fb_97517f307a46` (S.A.S.H.A #4), **slice 4** of umbrella epic `fb_fcf7617373f4`. Touches `workers/` (main) + one LMS wiring point + `_template` doc.

## Decisions (design gate)

1. **Scope = admission mechanic + additive course-keying.** The account is ALREADY unified (one `users` table by email, one JWT session cookie, CORS across all academy domains) — the real delta is (a) making the golden ticket real server-side and (b) keying learner data by course so a second course can't collide.
2. **Additive-only migration.** `ALTER TABLE … ADD COLUMN course TEXT NOT NULL DEFAULT 'tochka-sborki'` on `progress` + `intake_profiles`; new `admissions` table. NO primary-key rebuilds (SQLite PK change = table rebuild = non-additive on prod data; rejected). The PK limitation (`progress` PK stays `(user_id, lesson_slug)`, `intake_profiles` PK stays `user_id`) is documented as a future-course slug-namespacing convention.
3. **Server-verified grant.** `POST /api/academy/admission` verifies completion against data the server actually has: completed progress rows must cover ALL module slugs in `COURSE_CATALOG` (9 modules). No trust-the-client.
4. **Certificate page wires the grant fire-and-forget** — the ticket stays downloadable exactly as today even if the API call fails or the user isn't logged in; when it succeeds, the "symbolic" framing becomes a real server-side admission record.
5. **Prod migration via cloudflare-api MCP `/query`** (additive statements), NOT wrangler — per established ops practice. Local/test uses the migration file.

## Context (grep-before-build)

- `workers/src/`: router in `index.ts` (path/method if-chain, CORS via `getCorsHeaders`, `credentials: true`); `middleware.ts` `requireAuth(request, env)` → `Response | { sub, email }`; D1 as `env.DB` (`lib/types.ts`); JWT in `lib/jwt.ts`.
- `handlers/progress.ts`: `handleView`/`handleComplete` accept `{ lesson_slug }`, upsert keyed `(auth.sub, lesson_slug)`; `handleList` returns rows for the user. D1 rows carry FLAT slugs (LMS route is `/lessons/[slug]` — module and lesson pages share one flat namespace; `LessonLayout` posts `meta.slug`). The unit-wizard layer is localStorage-only — NOT in D1; the server criterion must not depend on it.
- `lib/course-catalog.ts`: `COURSE_CATALOG: CatalogEntry[]` — 9 module slugs (`00-kickstart` … `08-agent-engineering`) with topics. This is the server's own source for "what does complete mean".
- Migrations `0001`–`0013` applied; `users(id,email,created_at)`, `magic_links`, `progress(user_id,lesson_slug,viewed_at,completed_at, PK(user_id,lesson_slug))`, `intake_profiles(user_id PK, …)`.
- Handler test idiom (`progress.test.ts`): vitest, `makeAuthRequest` (signJWT + session cookie), `makeEnv()` with mocked `D1Database` (`prepare().bind().run/all/first`), 401-without-auth case first.
- Golden ticket: `fb_6ded7b` DONE as copy/visual; `LMS/tochka-sborki/web/lib/course/certificate.ts` comment explicitly says framing is SYMBOLIC ("no promise of access to the (unbuilt) S.A.S.H.A academy"); `components/pages/certificate-page.tsx` is `'use client'`, renders unconditionally (no completion gate today).
- Workers deploy check: `cd workers && npx wrangler deploy --dry-run` (memory: catches esbuild bundle breaks).

## Architecture

### 1. Migration `workers/migrations/0014_academy.sql`

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

### 2. `workers/src/handlers/academy.ts` — new handler module

```ts
export async function handleAdmission(request: Request, env: Env): Promise<Response>
export async function handleAcademyMe(request: Request, env: Env): Promise<Response>
```

`handleAdmission` (POST `/api/academy/admission`, auth required):
- Load the user's completed slugs: `SELECT lesson_slug FROM progress WHERE user_id = ? AND completed_at IS NOT NULL`.
- `missing = COURSE_CATALOG.map(m => m.slug).filter(slug => !completedSet.has(slug))`.
- `missing.length > 0` → `403 { error: 'course incomplete', missing }` (honest gap report).
- else → `INSERT OR IGNORE INTO admissions (user_id, course, granted_at) VALUES (?, 'tochka-sborki', ?)`, then read the row back → `200 { granted: true, course: 'tochka-sborki', granted_at }` (idempotent: repeat call returns the ORIGINAL granted_at).

`handleAcademyMe` (GET `/api/academy/me`, auth required):
- `admissions`: `SELECT course, granted_at FROM admissions WHERE user_id = ?`.
- `courses`: `SELECT course, COUNT(*) AS viewed, SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completed FROM progress WHERE user_id = ? GROUP BY course`.
- → `200 { email: auth.email, admissions, courses }`. API-first: no UI consumer in this slice (dark-ship).

Routes in `index.ts`: `/api/academy/admission` POST, `/api/academy/me` GET (beside the other `/api/*` branches, same CORS flow).

### 3. Course-keying in progress handlers (backward-compatible)

`handleView`/`handleComplete`: body gains optional `course?: string`; `const course = body.course ?? 'tochka-sborki'`; INSERT statements write the `course` column (upsert conflict target unchanged — PK is still `(user_id, lesson_slug)`). `handleList`: SELECT gains `course` in the projection. Existing clients that send no `course` behave identically.

### 4. LMS wiring — `certificate-page.tsx`

On mount (`useEffect`, once), fire-and-forget:

```ts
fetch('/api/academy/admission', { method: 'POST', credentials: 'include' }).catch(() => {})
```

No await in render, no UI change on failure/401/403 — the ticket stays exactly as it is today. Update the SYMBOLIC comment in `lib/course/certificate.ts` to: "Admission is granted server-side on verified completion (S4, fb_97517f307a46); the ticket page requests it fire-and-forget."

### 5. Future-course convention — `LMS/_template/CHECKLIST.md`

One checkbox in the registry step's section: new courses MUST send their `course` slug in `/api/progress/*` bodies AND namespace their lesson slugs (e.g. `<course>/<lesson>`) — `progress` PK is `(user_id, lesson_slug)` without course, so bare-slug collisions across courses are prevented by convention until a keyed PK migration is justified.

### 6. Tests

Workers (`handlers/academy.test.ts`, progress.test.ts additions — existing idiom: mocked D1, signed JWT cookie):
- admission: 401 without auth; 403 + `missing` list when catalog coverage incomplete (mock returns partial slugs); 200 granted when all 9 module slugs completed (mock returns full set); idempotent second call (INSERT OR IGNORE + original granted_at read-back).
- academy/me: 401 without auth; 200 shape `{ email, admissions, courses }` with mocked rows.
- progress: `course` defaults to `'tochka-sborki'` when absent; passed through when present (assert bind args).

LMS (`certificate-page` drift-guard, source-reading): page fires `POST` to `/api/academy/admission` with `credentials: 'include'` and a `.catch` (fire-and-forget); the SYMBOLIC wording is gone from `lib/course/certificate.ts`.

Gates: workers `npx vitest run` + `npx tsc --noEmit` + `npx wrangler deploy --dry-run`; LMS `npx vitest run` + `npx tsc --noEmit` (component changed → suite must stay green).

## Authenticity / values

The grant is verified, not claimed — the server checks real completion data; the 403 names what's missing instead of pretending. The ticket page's behavior for учеников doesn't regress (fire-and-forget). No new personal data collected; `admissions` stores only user_id/course/timestamp.

## Scope

- `workers/`: migration 0014, `handlers/academy.ts` (+test), `index.ts` routes, `handlers/progress.ts` course param (+test additions).
- LMS: `components/pages/certificate-page.tsx` (one useEffect), `lib/course/certificate.ts` (comment), drift-guard test.
- `LMS/_template/CHECKLIST.md`: one convention checkbox.
- **Out of scope:** academy profile UI, per-course intake PK rebuild, OAuth (blocked ticket), wizard localStorage layer, applying the prod migration (ops step at ship time via cloudflare-api MCP, not part of implementation commits).

## Backward compatibility

Migration additive-only (new table + defaulted columns). Progress API unchanged for existing clients. Certificate page renders identically when the API call fails. No new dependencies.

## Task decomposition (for the plan)

1. Migration 0014 + `handlers/academy.ts` (`handleAdmission` + `handleAcademyMe`) + routes in `index.ts` + `academy.test.ts` (TDD; workers tsc + dry-run gates).
2. Progress handlers course param + test additions (TDD).
3. LMS certificate-page wiring + comment update + drift-guard; `_template/CHECKLIST.md` convention line; full gates both apps.
