// Alumni networking directory (Phase C) — strict opt-in, no email exposed.
// A learner opts in with a contact handle + one-line blurb + an EFFORT-INTENT (the type of
// shared effort they want to gather a синергема around). Opted-in learners see each other
// clustered by effort. `niche` (from intake_profiles) is a secondary tag, not the cluster key.
import type { Env } from '../lib/types'

// Canonical effort-intent keys. MIRRORS lib/effort.ts EFFORT_INTENTS (monorepo boundary:
// workers/ cannot import from the Next app under LMS/). Keep these two in sync.
const EFFORT_KEYS = new Set(['co-build', 'mastermind', 'teach-swap', 'clients', 'peer-support'])

export interface AlumniEntry {
  effort: string | null
  niche: string | null
  contact: string | null
  blurb: string | null
}

/** List opted-in alumni (visible to any authed learner). Degrades to [] if the migration
 *  hasn't been applied yet (missing columns) so prod never 500s before go-live. */
export async function handleAlumniList(db: D1Database): Promise<Response> {
  try {
    const { results } = await db.prepare(
      `SELECT u.alumni_effort AS effort, p.niche AS niche, u.alumni_contact AS contact, u.alumni_blurb AS blurb
       FROM users u LEFT JOIN intake_profiles p ON p.user_id = u.id
       WHERE u.alumni_optin = 1
       ORDER BY u.alumni_effort, u.created_at`
    ).all<AlumniEntry>()
    return Response.json({ alumni: results ?? [] })
  } catch {
    // Columns not present yet (pre-migration) — empty directory rather than an error.
    return Response.json({ alumni: [] })
  }
}

/** Get / set the requester's own opt-in state. */
export async function handleAlumniMe(db: D1Database, userId: string): Promise<Response> {
  try {
    const row = await db.prepare(
      'SELECT alumni_optin AS optin, alumni_contact AS contact, alumni_blurb AS blurb, alumni_effort AS effort FROM users WHERE id = ?'
    ).bind(userId).first<{ optin: number; contact: string | null; blurb: string | null; effort: string | null }>()
    return Response.json({ optin: !!row?.optin, contact: row?.contact ?? null, blurb: row?.blurb ?? null, effort: row?.effort ?? null })
  } catch {
    return Response.json({ optin: false, contact: null, blurb: null, effort: null })
  }
}

export async function handleAlumniOptin(
  db: D1Database,
  userId: string,
  body: { optin?: boolean; contact?: string; blurb?: string; effort?: string }
): Promise<Response> {
  const optin = body.optin ? 1 : 0
  const contact = (body.contact ?? '').trim().slice(0, 120) || null
  const blurb = (body.blurb ?? '').trim().slice(0, 200) || null
  const effort = body.effort && EFFORT_KEYS.has(body.effort) ? body.effort : null
  if (optin && !contact) return Response.json({ error: 'contact required to opt in' }, { status: 400 })
  try {
    await db.prepare('UPDATE users SET alumni_optin = ?, alumni_contact = ?, alumni_blurb = ?, alumni_effort = ? WHERE id = ?')
      .bind(optin, contact, blurb, effort, userId).run()
    return Response.json({ ok: true, optin: !!optin, contact, blurb, effort })
  } catch {
    return Response.json({ error: 'alumni storage not ready (migration 0015 pending)' }, { status: 503 })
  }
}
