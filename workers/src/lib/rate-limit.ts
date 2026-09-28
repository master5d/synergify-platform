// Лимит частоты без таблицы и миграции — счётчик фиксированного окна в Cache API воркера
// (тот же приём, что кэш /api/interest-example). Волна 19: POST /api/intake/task-route.
//
// Честно о границах: Cache API — per-colo и не атомарен, запись может быть вытеснена раньше срока.
// Это мягкий потолок от «один пользователь молотит кнопку / скрипт с его куки», а не учёт до вызова.
// Жёсткий учёт = таблица D1 (как care_requests), это отдельная миграция.
//
// Ярус заслона (AGENTS.md правило 9): СОВЕТУЮЩИЙ — защищает квоту LLM, а не необратимый канал.
// Кэш недоступен → пропускаем, но громко (console.error с пометкой RATE LIMIT SKIPPED).

export interface RateLimitCache {
  match(key: string): Promise<Response | undefined>
  put(key: string, value: Response): Promise<void>
}

export interface RateLimitRule {
  /** Сколько вызовов допускается в окне. */
  limit: number
  windowSec: number
}

export type RateLimitResult =
  | { allowed: true; remaining: number; skipped?: false }
  | { allowed: true; skipped: true }
  | { allowed: false; retryAfterSec: number }

export const RATE_LIMIT_ORIGIN = 'https://rate-limit.cache'

export function rateLimitKey(scope: string, subject: string, windowStart: number): string {
  return `${RATE_LIMIT_ORIGIN}/v1/${encodeURIComponent(scope)}/${encodeURIComponent(subject)}/${windowStart}`
}

/**
 * Считает вызов и отвечает, пропускать ли его. Отказанный вызов счётчик не увеличивает.
 * `now` — миллисекунды (для тестов).
 */
export async function hitRateLimit(
  cache: RateLimitCache, scope: string, subject: string, rule: RateLimitRule, now: number = Date.now(),
): Promise<RateLimitResult> {
  const nowSec = Math.floor(now / 1000)
  const windowStart = nowSec - (nowSec % rule.windowSec)
  const windowEnd = windowStart + rule.windowSec
  const key = rateLimitKey(scope, subject, windowStart)
  try {
    const hit = await cache.match(key)
    const raw = hit ? Number(await hit.text()) : 0
    const count = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0
    if (count >= rule.limit) return { allowed: false, retryAfterSec: Math.max(1, windowEnd - nowSec) }
    await cache.put(key, new Response(String(count + 1), {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': `public, max-age=${Math.max(1, windowEnd - nowSec)}` },
    }))
    return { allowed: true, remaining: rule.limit - count - 1 }
  } catch (e) {
    console.error(`rate-limit: RATE LIMIT SKIPPED for ${scope} — cache unavailable`, e)
    return { allowed: true, skipped: true }
  }
}
