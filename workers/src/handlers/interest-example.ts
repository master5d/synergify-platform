// POST /api/interest-example — пример концепт-фазы под сферу ученика (intake LMS#8).
// Спека: docs/superpowers/specs/2026-09-28-interest-example.md
//
// Исходник берём из списка pack'а (не от клиента), интерес — из intake_profiles.niche (не от клиента).
// Кэш — Cache API воркера (без таблицы и миграции). Деградация — как prose_source='template'
// в intake.ts: любой сбой = общий пример ученику + улика в лог воркера.
import { callLlm } from '../lib/llm-client'
import type { LlmEnv } from '../lib/llm-client'
import { INTEREST_EXAMPLES as TS_EXAMPLES } from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/course/interest-examples'
import { INTEREST_EXAMPLES as LP_EXAMPLES } from '../../../LMS/tochka-sborki/web/packs/living-practice/course/interest-examples'
import { MANIFEST as TS_MANIFEST } from '../../../LMS/tochka-sborki/web/packs/tochka-sborki/manifest'
import { MANIFEST as LP_MANIFEST } from '../../../LMS/tochka-sborki/web/packs/living-practice/manifest'
import { checkInterestExample } from '../../../LMS/tochka-sborki/web/lib/interest-example/guard'
import { interestCacheKey } from '../../../LMS/tochka-sborki/web/lib/interest-example/cache-key'
import { interestKey, type Interest } from '../../../LMS/tochka-sborki/web/lib/interest-example/interests'
import { findInterestExample, type InterestExampleItem, type InterestExampleResponse, type InterestLocale } from '../../../LMS/tochka-sborki/web/lib/interest-example/types'
import type { ManifestRule } from '../../../LMS/tochka-sborki/web/lib/authoring/manifest'

/** Оба pack'а: воркер один на все домены. Ключи module/unit/id не пересекаются (тест). */
export const ALL_EXAMPLES: readonly InterestExampleItem[] = [...TS_EXAMPLES, ...LP_EXAMPLES]
/** Объединение манифестов строже любого из них — в кэш не попадёт то, что запрещено хоть одному курсу. */
export const ALL_RULES: ManifestRule[] = [...TS_MANIFEST, ...LP_MANIFEST]

/** Сколько ученик ждёт генерацию на холодном ключе; дальше — общий пример и pending. */
export const RACE_MS = 4_000
/** Воркер → llm-service; дольше внутренних 20 с сервиса, чтобы видеть настоящую причину. */
export const INTEREST_LLM_TIMEOUT_MS = 25_000
export const OK_TTL_S = 30 * 24 * 3600
export const REJECTED_TTL_S = 3600

type Outcome = { text: string } | 'rejected' | 'unavailable'
type Cached = { kind: 'ok'; interest: Interest; text: string } | { kind: 'rejected' }

export interface InterestDeps {
  cache: Pick<Cache, 'match' | 'put'>
  waitUntil: (p: Promise<unknown>) => void
  fetchImpl?: typeof fetch
  raceMs?: number
}

const json = (body: InterestExampleResponse | { error: string }, status = 200) => Response.json(body, { status })
const template = (reason: 'no_interest' | 'rejected' | 'unavailable' | 'pending') => json({ source: 'template', reason })

function cacheResponse(value: Cached, ttl: number): Response {
  return new Response(JSON.stringify(value), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` },
  })
}

async function generate(
  key: string, source: string, interest: Interest, locale: InterestLocale, llm: LlmEnv, deps: InterestDeps,
): Promise<Outcome> {
  let example: string
  try {
    const r = await callLlm<{ example: string }>('/interest-example', { source, interest, language: locale }, llm, deps.fetchImpl, INTEREST_LLM_TIMEOUT_MS)
    example = typeof r?.example === 'string' ? r.example.trim() : ''
  } catch (e) {
    // Сетевой сбой в кэш не пишем: следующий заход попробует снова.
    console.error('lms-llm /interest-example failed, serving the general example:', e)
    return 'unavailable'
  }
  const findings = checkInterestExample(source, example, ALL_RULES)
  if (findings.length) {
    console.error(`interest-example rejected by guard (${key}):`, findings.join('; '))
    await deps.cache.put(key, cacheResponse({ kind: 'rejected' }, REJECTED_TTL_S))
    return 'rejected'
  }
  await deps.cache.put(key, cacheResponse({ kind: 'ok', interest, text: example }, OK_TTL_S))
  return { text: example }
}

export async function handleInterestExample(
  db: D1Database, userId: string, body: unknown, llm: LlmEnv, deps: InterestDeps,
): Promise<Response> {
  const b = (body ?? {}) as Record<string, unknown>
  const locale = b.locale === 'en' ? 'en' : b.locale === 'ru' ? 'ru' : null
  if (typeof b.module !== 'string' || typeof b.unit !== 'string' || typeof b.id !== 'string' || !locale) {
    return json({ error: 'bad_request' }, 400)
  }
  const item = findInterestExample(ALL_EXAMPLES, b.module, b.unit, b.id)
  if (!item) return json({ error: 'unknown_example' }, 404)

  const row = await db.prepare('SELECT niche FROM intake_profiles WHERE user_id = ?').bind(userId).first<{ niche: string | null }>()
  const interest = interestKey(row?.niche)
  if (!interest) return template('no_interest')

  const source = item.text[locale]
  const key = interestCacheKey({ module: item.module, unit: item.unit, id: item.id, locale, interest, source })!
  const hit = await deps.cache.match(key)
  if (hit) {
    const v = await hit.json().catch(() => null) as Cached | null
    if (v?.kind === 'ok' && typeof v.text === 'string') return json({ source: 'interest', interest, text: v.text })
    if (v?.kind === 'rejected') return template('rejected')
  }

  // Холодный ключ: генерация доживает в waitUntil и кладёт в кэш, а ученик ждёт не дольше RACE_MS.
  const job = generate(key, source, interest, locale, llm, deps).catch(e => {
    console.error('interest-example generation crashed:', e)
    return 'unavailable' as const
  })
  deps.waitUntil(job)
  const PENDING = Symbol('pending')
  let timer: ReturnType<typeof setTimeout> | undefined
  const raced = await Promise.race([
    job,
    new Promise<typeof PENDING>(r => { timer = setTimeout(() => r(PENDING), deps.raceMs ?? RACE_MS) }),
  ])
  if (timer) clearTimeout(timer)
  if (raced === PENDING) return template('pending')
  if (typeof raced === 'string') return template(raced)
  return json({ source: 'interest', interest, text: raced.text })
}
