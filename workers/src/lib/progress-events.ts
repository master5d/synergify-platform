import type { Env } from './types'

const strip = (s: string | undefined) => (s ?? '').replace(/^﻿/, '').trim()

// Событие прогресса → Listmonk (intake LMS#3). Воркер кладёт ТОЛЬКО данные: подписчика в
// список-назначение и атрибуты completed_modules / completed_course. Кампании отсюда не
// шлются — письмо отправляет автоматизация Listmonk, которую настраивает владелец.
// Выключено по умолчанию (PROGRESS_EVENTS_ENABLED="0"); best-effort, как lib/crm.ts:
// никогда не роняет ответ ученику.

/** Структура курса «модуль → юниты». Воркер не видит контент pack'а, поэтому её
 *  присылает клиент вместе с завершением юнита. */
export type Outline = Record<string, string[]>

const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/i
const MAX_MODULES = 64
const MAX_UNITS = 64

/** Разбор присланной структуры курса; мусор → null (событий не будет, прогресс пишется как раньше). */
export function parseOutline(raw: unknown): Outline | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const entries = Object.entries(raw as Record<string, unknown>)
  if (entries.length === 0 || entries.length > MAX_MODULES) return null
  const out: Outline = {}
  for (const [mod, units] of entries) {
    if (!SLUG.test(mod) || !Array.isArray(units) || units.length === 0 || units.length > MAX_UNITS) return null
    if (!units.every(u => typeof u === 'string' && SLUG.test(u))) return null
    out[mod] = units as string[]
  }
  return out
}

export function isValidCourse(course: string): boolean {
  return SLUG.test(course)
}

/** Какие модули курса завершены целиком (все юниты `модуль/юнит` в completed). */
export function completedModules(outline: Outline, completed: Set<string>): string[] {
  return Object.entries(outline)
    .filter(([mod, units]) => units.every(u => completed.has(`${mod}/${u}`)))
    .map(([mod]) => mod)
}

interface ProgressEvent { kind: 'module' | 'course'; subject: string }

export interface ProgressEventInput {
  userId: string
  email: string
  course: string
  lessonSlug: string
  outline: Outline | null
}

/** Точка входа из handleComplete. Не бросает. */
export async function emitProgressEvents(env: Env, input: ProgressEventInput): Promise<void> {
  try {
    await emit(env, input)
  } catch (e) {
    console.error('progress-events failed', e)
  }
}

async function emit(env: Env, { userId, email, course, lessonSlug, outline }: ProgressEventInput): Promise<void> {
  const listId = Number(strip(env.LISTMONK_PROGRESS_LIST_ID))
  if (strip(env.PROGRESS_EVENTS_ENABLED) !== '1' || !listId) {
    console.log('progress-events: disabled (PROGRESS_EVENTS_ENABLED/LISTMONK_PROGRESS_LIST_ID), skip')
    return
  }
  if (!outline) return
  const slash = lessonSlug.indexOf('/')
  if (slash < 0) return
  const mod = lessonSlug.slice(0, slash)
  // Событие рождает только завершение юнита, который есть в присланной структуре.
  if (!outline[mod]?.includes(lessonSlug.slice(slash + 1))) return
  if (!email) {
    console.log('progress-events: user has no email, skip')
    return
  }

  const { results } = await env.DB.prepare(
    'SELECT lesson_slug FROM progress WHERE user_id = ? AND course = ? AND completed_at IS NOT NULL'
  ).bind(userId, course).all<{ lesson_slug: string }>()
  const done = completedModules(outline, new Set((results ?? []).map(r => r.lesson_slug)))
  if (!done.includes(mod)) return

  const candidates: ProgressEvent[] = [{ kind: 'module', subject: mod }]
  if (done.length === Object.keys(outline).length) candidates.push({ kind: 'course', subject: course })

  // Идемпотентность: событие «захватывается» строкой progress_events; уже захваченное не шлём.
  const now = Math.floor(Date.now() / 1000)
  const fresh: ProgressEvent[] = []
  for (const ev of candidates) {
    const res = await env.DB.prepare(
      'INSERT OR IGNORE INTO progress_events (user_id, course, kind, subject, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, course, ev.kind, ev.subject, now).run()
    if ((res.meta?.changes ?? 0) > 0) fresh.push(ev)
  }
  if (fresh.length === 0) return

  const ok = await upsertProgressSubscriber(env, listId, email, {
    // Все завершённые модули курса, а не только новый: догоняет пропущенные ранее события.
    modules: done.map(m => `${course}/${m}`),
    courses: fresh.some(e => e.kind === 'course') ? [course] : [],
  })
  if (ok) return

  // Listmonk не принял — снимаем захват, чтобы следующее завершение попробовало снова.
  for (const ev of fresh) {
    await env.DB.prepare(
      'DELETE FROM progress_events WHERE user_id = ? AND course = ? AND kind = ? AND subject = ?'
    ).bind(userId, course, ev.kind, ev.subject).run()
  }
}

interface ListmonkSubscriber {
  id: number
  email: string
  name: string
  status: string
  attribs?: Record<string, unknown>
  lists?: { id: number }[]
}

function union(existing: unknown, add: string[]): string[] {
  const base = Array.isArray(existing) ? existing.filter((x): x is string => typeof x === 'string') : []
  return [...new Set([...base, ...add])]
}

/** Подписчик в список-назначение + атрибуты. true = Listmonk принял (или менять нечего). */
export async function upsertProgressSubscriber(
  env: Env,
  listId: number,
  email: string,
  add: { modules: string[]; courses: string[] },
): Promise<boolean> {
  const url = strip(env.LISTMONK_URL)
  const user = strip(env.LISTMONK_API_USER)
  const token = strip(env.LISTMONK_API_TOKEN)
  if (!url || !user || !token) {
    console.log('progress-events: listmonk credentials not configured, skip')
    return false
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `token ${user}:${token}`,
    'CF-Access-Client-Id': strip(env.CF_ACCESS_CLIENT_ID),
    'CF-Access-Client-Secret': strip(env.CF_ACCESS_CLIENT_SECRET),
  }
  const addr = email.trim().toLowerCase()
  try {
    const query = `subscribers.email = '${addr.replace(/'/g, "''")}'`
    const found = await fetch(`${url}/api/subscribers?per_page=1&query=${encodeURIComponent(query)}`, { headers })
    if (!found.ok) {
      console.error('listmonk progress lookup non-OK', found.status, await found.text())
      return false
    }
    const existing = ((await found.json()) as { data?: { results?: ListmonkSubscriber[] } }).data?.results?.[0]

    if (!existing) {
      const res = await fetch(`${url}/api/subscribers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: addr,
          name: '',
          status: 'enabled',
          lists: [listId],
          attribs: { completed_modules: add.modules, completed_course: add.courses },
          preconfirm_subscriptions: false, // single opt-in, как CRM-список
        }),
      })
      if (!res.ok) console.error('listmonk progress create non-OK', res.status, await res.text())
      return res.ok
    }

    // Заблокированного не трогаем: его отказ от писем важнее нашего события.
    if (existing.status === 'blocklisted') {
      console.log('progress-events: subscriber blocklisted, skip')
      return true
    }
    // PUT заменяет attribs и lists целиком → сливаем с тем, что уже есть у подписчика.
    const attribs = existing.attribs ?? {}
    const res = await fetch(`${url}/api/subscribers/${existing.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        email: existing.email,
        name: existing.name,
        status: existing.status,
        lists: [...new Set([...(existing.lists ?? []).map(l => l.id), listId])],
        attribs: {
          ...attribs,
          completed_modules: union(attribs.completed_modules, add.modules),
          completed_course: union(attribs.completed_course, add.courses),
        },
        preconfirm_subscriptions: false,
      }),
    })
    if (!res.ok) console.error('listmonk progress update non-OK', res.status, await res.text())
    return res.ok
  } catch (e) {
    console.error('listmonk progress upsert failed', e)
    return false
  }
}
