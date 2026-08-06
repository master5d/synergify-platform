import type { Env } from '../lib/types'
import { extractSignals, valueTier, normalizeTopicKey, shouldRaiseBrief, WINDOW_MS } from '../lib/demand-signals'
import { classifyDemand, draftBrief } from '../lib/demand-gemini'
import { COURSE_CATALOG } from '../lib/course-catalog'

const VALID_STATUS = ['open', 'accepted', 'rejected', 'shipped']

export async function listBriefs(db: D1Database, status?: string): Promise<Response> {
  const rows = status
    ? (await db.prepare('SELECT * FROM content_demand_briefs WHERE status = ? ORDER BY created_at DESC').bind(status).all()).results
    : (await db.prepare('SELECT * FROM content_demand_briefs ORDER BY created_at DESC').all()).results
  const briefs = (rows ?? []).map((r: any) => ({
    ...r,
    proposal: safeParse(r.proposal_json),
  }))
  return Response.json(briefs)
}

export async function listSignals(db: D1Database, classification?: string): Promise<Response> {
  const rows = classification
    ? (await db.prepare('SELECT * FROM content_demand_signals WHERE classification = ? ORDER BY created_at DESC').bind(classification).all()).results
    : (await db.prepare('SELECT * FROM content_demand_signals ORDER BY created_at DESC').all()).results
  return Response.json(rows ?? [])
}

export async function decideBrief(db: D1Database, id: string, status: string): Promise<Response> {
  if (!VALID_STATUS.includes(status)) {
    return Response.json({ error: 'invalid_status' }, { status: 400 })
  }
  await db.prepare('UPDATE content_demand_briefs SET status = ?, decided_at = ? WHERE id = ?')
    .bind(status, Date.now(), id).run()
  return Response.json({ ok: true })
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}

export async function runDemandRadar(
  env: Env,
  userId: string,
  answers: Record<string, unknown>,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  try {
    const signals = extractSignals(answers)
    if (!signals.length) return
    const classifications = await classifyDemand(signals, COURSE_CATALOG, env.GEMINI_API_KEY, fetchImpl)
    const now = Date.now()
    for (let i = 0; i < signals.length; i++) {
      const s = signals[i]
      const c = classifications[i]
      const tier = valueTier(answers, c.value_tier)
      const topicKey = c.gap_topic_key ? normalizeTopicKey(c.gap_topic_key) : null
      await env.DB.prepare(
        `INSERT INTO content_demand_signals
           (id,user_id,source_question,raw_text,classification,matched_module,gap_topic_key,gap_topic_label,feasibility_note,value_tier,brief_id,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).bind(
        crypto.randomUUID(), userId, s.source, s.text, c.classification, c.matched_module, topicKey,
        c.gap_topic_label ? JSON.stringify(c.gap_topic_label) : null, c.feasibility_note, tier, null, now,
      ).run()

      if (c.classification === 'gap' && topicKey) {
        await maybeRaiseBrief(env, topicKey, c.gap_topic_label ?? { ru: topicKey, en: topicKey }, tier, now, fetchImpl)
      }
    }
  } catch (e) {
    console.error('demand radar error:', e)
  }
}

async function maybeRaiseBrief(
  env: Env,
  topicKey: string,
  label: { ru: string; en: string },
  tier: 'high' | 'normal',
  now: number,
  fetchImpl: typeof fetch,
): Promise<void> {
  const open = await env.DB.prepare(
    `SELECT id FROM content_demand_briefs WHERE gap_topic_key = ? AND status='open' LIMIT 1`,
  ).bind(topicKey).first()
  const hasOpen = !!open

  let count = 0
  if (tier !== 'high') {
    const row: any = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM content_demand_signals WHERE gap_topic_key = ? AND classification='gap' AND created_at > ?`,
    ).bind(topicKey, now - WINDOW_MS).first()
    count = (row?.n as number) ?? 0
  }

  if (!shouldRaiseBrief(tier, count, hasOpen)) return

  const quotesRes = await env.DB.prepare(
    `SELECT raw_text FROM content_demand_signals WHERE gap_topic_key = ? AND classification='gap'`,
  ).bind(topicKey).all()
  const quotes = (quotesRes.results ?? []).map((r: any) => r.raw_text as string)

  const proposal = await draftBrief(label, quotes, COURSE_CATALOG, env.GEMINI_API_KEY, fetchImpl)
  const briefId = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO content_demand_briefs (id,gap_topic_key,status,proposal_json,signal_count,created_at,decided_at)
     VALUES (?,?,'open',?,?,?,?)`,
  ).bind(briefId, topicKey, JSON.stringify(proposal), quotes.length, now, null).run()
  await env.DB.prepare(
    `UPDATE content_demand_signals SET brief_id = ? WHERE gap_topic_key = ? AND brief_id IS NULL`,
  ).bind(briefId, topicKey).run()
}
