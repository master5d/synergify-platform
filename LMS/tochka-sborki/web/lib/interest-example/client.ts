// lib/interest-example/client.ts — клиент концепт-фазы (статический экспорт → запрос к воркеру).
// Любой отказ (нет сессии, нет интереса, сеть, таймаут, гвард) = null = общий пример, который уже на экране.
import type { ManifestRule } from '../authoring/manifest'
import { checkInterestExample } from './guard'
import { interestKey, type Interest } from './interests'
import type { InterestExampleResponse, InterestLocale } from './types'

export const CLIENT_TIMEOUT_MS = 6_000
/** Воркер ответил pending: генерация доживает в waitUntil. Повтор — один, дальше общий пример. */
export const RETRY_DELAY_MS = 8_000

export interface InterestExampleRequest { module: string; unit: string; id: string; locale: InterestLocale }

export interface LoadOptions {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  retryDelayMs?: number
  sleep?: (ms: number) => Promise<void>
  endpoint?: string
}

async function requestOnce(req: InterestExampleRequest, o: Required<Pick<LoadOptions, 'fetchImpl' | 'timeoutMs' | 'endpoint'>>): Promise<InterestExampleResponse | null> {
  try {
    const res = await o.fetchImpl(o.endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(o.timeoutMs),
    })
    if (!res.ok) return null
    return await res.json() as InterestExampleResponse
  } catch {
    return null
  }
}

export async function loadInterestExample(
  req: InterestExampleRequest, source: string, rules: ManifestRule[], opts: LoadOptions = {},
): Promise<{ interest: Interest; text: string } | null> {
  const o = {
    fetchImpl: opts.fetchImpl ?? fetch,
    timeoutMs: opts.timeoutMs ?? CLIENT_TIMEOUT_MS,
    endpoint: opts.endpoint ?? '/api/interest-example',
  }
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>(r => setTimeout(r, ms)))
  let r = await requestOnce(req, o)
  if (r?.source === 'template' && r.reason === 'pending') {
    await sleep(opts.retryDelayMs ?? RETRY_DELAY_MS)
    r = await requestOnce(req, o)
  }
  if (!r || r.source !== 'interest' || typeof r.text !== 'string') return null
  const interest = interestKey(r.interest)
  if (!interest) return null
  // Вторая проверка — манифестом СВОЕГО pack'а: воркер мог закэшировать по старым правилам.
  if (checkInterestExample(source, r.text, rules).length) return null
  return { interest, text: r.text }
}
