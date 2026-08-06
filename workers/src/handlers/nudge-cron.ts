import type { Env } from '../lib/types'
import { nextLesson, lessonUrl } from '../lib/course-order'
import { shouldNudge, THROTTLE_SEC } from '../lib/nudge-policy'
import { botCopy, pickLocale, pickNudge } from '../lib/bot-copy'
import { sendMessage } from '../lib/telegram-api'

interface Candidate {
  id: string
  telegram_id: string
  language: string | null
  created_at: number
  last_nudge_at: number | null
}

export async function runDailyNudge(env: Env, nowSec: number = Math.floor(Date.now() / 1000)): Promise<{ sent: number }> {
  const throttleBefore = nowSec - THROTTLE_SEC
  const { results: candidates } = await env.DB.prepare(
    'SELECT id, telegram_id, language, created_at, last_nudge_at FROM users ' +
    'WHERE telegram_id IS NOT NULL AND nudge_optout = 0 AND (last_nudge_at IS NULL OR last_nudge_at < ?)'
  ).bind(throttleBefore).all<Candidate>()

  let sent = 0
  for (const c of candidates ?? []) {
    try {
      const { results: prog } = await env.DB.prepare(
        'SELECT lesson_slug, viewed_at, completed_at FROM progress WHERE user_id = ?'
      ).bind(c.id).all<{ lesson_slug: string; viewed_at: number; completed_at: number | null }>()

      const completed = new Set<string>()
      const viewed = new Set<string>()
      let lastActivityAt = c.created_at
      for (const r of prog ?? []) {
        viewed.add(r.lesson_slug)
        if (r.completed_at) completed.add(r.lesson_slug)
        lastActivityAt = Math.max(lastActivityAt, r.viewed_at ?? 0, r.completed_at ?? 0)
      }

      const next = nextLesson(completed, viewed)
      const ok = shouldNudge({
        optout: false,
        lastNudgeAt: c.last_nudge_at,
        lastActivityAt,
        hasIncomplete: next !== null,
        nowSec,
      })
      if (!ok || !next) continue

      const locale = pickLocale(c.language)
      const copy = botCopy(locale)
      await sendMessage(env, Number(c.telegram_id), pickNudge(locale, nowSec), { text: copy.nudgeLabel, url: lessonUrl(next.slug, locale) })
      await env.DB.prepare('UPDATE users SET last_nudge_at = ? WHERE id = ?').bind(nowSec, c.id).run()
      sent++
    } catch (e) {
      console.error('nudge send failed for', c.id, e)
    }
  }
  return { sent }
}
