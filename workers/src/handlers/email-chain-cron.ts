// Ежедневный прогон учебных цепочек писем (контракт: workers/email-templates/README.md).
// Решает lib/email-chains.ts (чистая политика); здесь только I/O: D1 → политика → Listmonk tx.
// Выключено по умолчанию (EMAIL_CHAINS_ENABLED="0"). Одно письмо не роняет прогон.
import type { Env } from '../lib/types'
import {
  CHAIN_COURSES, WINDOWS, pickLocale, pickStep, templateName,
  type ChainCourse, type ChainPick, type ModuleEvent, type ProgressRow, EMAIL_THROTTLE_SEC,
} from '../lib/email-chains'
import { unsubscribeUrl } from '../lib/email-unsubscribe'
import { addCrmContact } from '../lib/crm'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()
const DAY = 24 * 60 * 60

/** Защита от лавины: больше за один прогон не шлём, остальные — завтра. */
export const MAX_SENDS_PER_RUN = 200

interface Candidate {
  id: string
  email: string
  language: string | null
  created_at: number
  telegram_id: string | null
  nudge_optout: number
  last_email_at: number | null
}

interface Listmonk { url: string; headers: Record<string, string> }

export interface ChainRunResult { sent: number; failed: number; skipped: string | null }

export async function runEmailChains(env: Env, nowSec: number = Math.floor(Date.now() / 1000)): Promise<ChainRunResult> {
  if (strip(env.EMAIL_CHAINS_ENABLED) !== '1') {
    console.log('email-chains: disabled (EMAIL_CHAINS_ENABLED), skip')
    return { sent: 0, failed: 0, skipped: 'disabled' }
  }
  const lm = listmonk(env)
  if (!lm || !strip(env.WORKER_JWT_SECRET)) {
    console.log('email-chains: listmonk credentials / WORKER_JWT_SECRET not configured, skip')
    return { sent: 0, failed: 0, skipped: 'not-configured' }
  }
  const templates = await loadTxTemplates(lm)
  if (!templates) return { sent: 0, failed: 0, skipped: 'templates-unavailable' }

  let sent = 0
  let failed = 0
  for (const course of CHAIN_COURSES) {
    for (const c of await candidates(env, course, nowSec)) {
      if (sent >= MAX_SENDS_PER_RUN) {
        console.log(`email-chains: run cap ${MAX_SENDS_PER_RUN} reached, rest tomorrow`)
        return { sent, failed, skipped: null }
      }
      try {
        const r = await processCandidate(env, lm, templates, course, c, nowSec)
        if (r === 'sent') sent++
        else if (r === 'failed') failed++
      } catch (e) {
        failed++
        console.error('email-chains: candidate failed', c.id, e)
      }
    }
  }
  console.log('email-chains: run done', JSON.stringify({ sent, failed }))
  return { sent, failed, skipped: null }
}

type Outcome = 'sent' | 'failed' | 'none'

async function processCandidate(
  env: Env, lm: Listmonk, templates: Map<string, number>, course: ChainCourse, c: Candidate, nowSec: number,
): Promise<Outcome> {
  const [prog, events, sends] = await Promise.all([
    env.DB.prepare('SELECT lesson_slug, viewed_at, completed_at FROM progress WHERE user_id = ? AND course = ?')
      .bind(c.id, course.key).all<ProgressRow>(),
    env.DB.prepare('SELECT kind, subject, created_at FROM progress_events WHERE user_id = ? AND course = ?')
      .bind(c.id, course.key).all<ModuleEvent & { kind: string }>(),
    env.DB.prepare('SELECT step_key, sent_at FROM email_sends WHERE user_id = ? AND course = ?')
      .bind(c.id, course.key).all<{ step_key: string; sent_at: number }>(),
  ])
  const ev = events.results ?? []
  const locale = pickLocale(c.language)
  const pick = pickStep({
    nowSec,
    locale,
    course,
    createdAt: c.created_at,
    emailOptout: false,               // отфильтрован в SQL
    lastEmailAt: c.last_email_at,
    telegramNudges: c.telegram_id != null && !c.nudge_optout,
    progress: prog.results ?? [],
    moduleEvents: ev.filter(e => e.kind === 'module'),
    courseEventAt: ev.find(e => e.kind === 'course')?.created_at ?? null,
    sent: new Map((sends.results ?? []).map(s => [s.step_key, s.sent_at])),
  })
  if (!pick) return 'none'

  const name = templateName(course, pick.step, locale)
  const templateId = templates.get(name)
  if (!templateId) {
    console.error('email-chains: tx template missing in listmonk, skip', name)
    return 'none'
  }

  const sub = await subscriberStatus(lm, c.email)
  if (sub === 'error') return 'failed'
  if (sub === 'blocklisted') {
    // Отказ от писем в Listmonk важнее цепочки; флаг, чтобы не спрашивать Listmonk каждый день.
    await env.DB.prepare('UPDATE users SET email_optout = 1 WHERE id = ?').bind(c.id).run()
    console.log('email-chains: subscriber blocklisted, opted out', c.id)
    return 'none'
  }
  if (sub === 'missing' && !(await addCrmContact(env, { email: c.email, language: locale, source: 'email-chains' }))) {
    return 'failed'
  }

  // Захват шага ДО отправки: второй прогон/параллельный cron шаг не повторит.
  const captured = await capture(env, c.id, course.key, pick.stepKey, nowSec)
  if (!captured) return 'none'
  const marked: string[] = []
  for (const k of pick.alsoMark) if (await capture(env, c.id, course.key, k, nowSec)) marked.push(k)

  const ok = await sendTx(lm, {
    email: c.email,
    templateId,
    pick,
    unsub: await unsubscribeUrl(c.id, strip(env.WORKER_JWT_SECRET)),
  })
  if (!ok) {
    for (const k of [pick.stepKey, ...marked]) {
      await env.DB.prepare('DELETE FROM email_sends WHERE user_id = ? AND course = ? AND step_key = ?')
        .bind(c.id, course.key, k).run()
    }
    return 'failed'
  }
  await env.DB.prepare('UPDATE users SET last_email_at = ? WHERE id = ?').bind(nowSec, c.id).run()
  console.log('email-chains: sent', JSON.stringify({ user: c.id, step: pick.stepKey }))
  return 'sent'
}

/** Кандидаты: не отписаны, не писали 20 ч, и хоть какое-то окно цепочки может быть открыто. */
async function candidates(env: Env, course: ChainCourse, nowSec: number): Promise<Candidate[]> {
  const regSince = nowSec - WINDOWS['start-2'][1] * DAY
  const activeSince = nowSec - WINDOWS['lapse-3'][1] * DAY
  const eventSince = nowSec - Math.max(WINDOWS.milestone[1], WINDOWS['finish-1'][1]) * DAY
  const finishSince = nowSec - WINDOWS['finish-2'][1] * DAY
  const { results } = await env.DB.prepare(
    'SELECT id, email, language, created_at, telegram_id, nudge_optout, last_email_at FROM users u ' +
    "WHERE email_optout = 0 AND email IS NOT NULL AND email != '' " +
    'AND (last_email_at IS NULL OR last_email_at < ?) AND (' +
    'created_at >= ? ' +
    'OR EXISTS (SELECT 1 FROM progress p WHERE p.user_id = u.id AND p.course = ? AND MAX(p.viewed_at, COALESCE(p.completed_at, 0)) >= ?) ' +
    'OR EXISTS (SELECT 1 FROM progress_events e WHERE e.user_id = u.id AND e.course = ? AND e.created_at >= ?) ' +
    "OR EXISTS (SELECT 1 FROM email_sends s WHERE s.user_id = u.id AND s.course = ? AND s.step_key = 'finish-1' AND s.sent_at >= ?)" +
    ') ORDER BY created_at'
  ).bind(nowSec - EMAIL_THROTTLE_SEC, regSince, course.key, activeSince, course.key, eventSince, course.key, finishSince)
    .all<Candidate>()
  return results ?? []
}

async function capture(env: Env, userId: string, course: string, key: string, nowSec: number): Promise<boolean> {
  const res = await env.DB.prepare(
    'INSERT OR IGNORE INTO email_sends (user_id, course, step_key, sent_at) VALUES (?, ?, ?, ?)'
  ).bind(userId, course, key, nowSec).run()
  return (res.meta?.changes ?? 0) > 0
}

function listmonk(env: Env): Listmonk | null {
  const url = strip(env.LISTMONK_URL)
  const user = strip(env.LISTMONK_API_USER)
  const token = strip(env.LISTMONK_API_TOKEN)
  if (!url || !user || !token) return null
  return {
    url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${user}:${token}`,
      'CF-Access-Client-Id': strip(env.CF_ACCESS_CLIENT_ID),
      'CF-Access-Client-Secret': strip(env.CF_ACCESS_CLIENT_SECRET),
    },
  }
}

const TIMEOUT_MS = 10_000
const call = (lm: Listmonk, path: string, init: RequestInit = {}) =>
  fetch(`${lm.url}${path}`, { ...init, headers: lm.headers, signal: AbortSignal.timeout(TIMEOUT_MS) })

/** Один GET /api/templates за прогон: имя tx-шаблона → id. null = Listmonk не ответил. */
async function loadTxTemplates(lm: Listmonk): Promise<Map<string, number> | null> {
  try {
    const res = await call(lm, '/api/templates?no_body=true')
    if (!res.ok) {
      console.error('email-chains: listmonk templates non-OK', res.status, await res.text())
      return null
    }
    const list = ((await res.json()) as { data?: { id: number; name: string; type: string }[] }).data ?? []
    return new Map(list.filter(t => t.type === 'tx').map(t => [t.name, t.id]))
  } catch (e) {
    console.error('email-chains: listmonk templates failed', e)
    return null
  }
}

async function subscriberStatus(lm: Listmonk, email: string): Promise<'ok' | 'missing' | 'blocklisted' | 'error'> {
  const addr = email.trim().toLowerCase()
  const query = `subscribers.email = '${addr.replace(/'/g, "''")}'`
  try {
    const res = await call(lm, `/api/subscribers?per_page=1&query=${encodeURIComponent(query)}`)
    if (!res.ok) {
      console.error('email-chains: listmonk subscriber lookup non-OK', res.status, await res.text())
      return 'error'
    }
    const found = ((await res.json()) as { data?: { results?: { status: string }[] } }).data?.results?.[0]
    if (!found) return 'missing'
    return found.status === 'blocklisted' ? 'blocklisted' : 'ok'
  } catch (e) {
    console.error('email-chains: listmonk subscriber lookup failed', e)
    return 'error'
  }
}

async function sendTx(lm: Listmonk, p: { email: string; templateId: number; pick: ChainPick; unsub: string }): Promise<boolean> {
  try {
    const res = await call(lm, '/api/tx', {
      method: 'POST',
      body: JSON.stringify({
        subscriber_email: p.email,
        template_id: p.templateId,
        data: { ...p.pick.data, unsubscribe_url: p.unsub },
        // models.Headers = []map[string]string (listmonk v6.2 models/common.go)
        headers: [
          { 'List-Unsubscribe': `<${p.unsub}>` },
          { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        ],
        content_type: 'html',
      }),
    })
    if (!res.ok) console.error('email-chains: listmonk tx non-OK', res.status, await res.text())
    return res.ok
  } catch (e) {
    console.error('email-chains: listmonk tx failed', e)
    return false
  }
}
