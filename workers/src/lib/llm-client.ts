/**
 * Клиент узкого LLM-сервиса (hetzner, за CF Access). Воркер с эджа не достаёт
 * до тайнета, поэтому в гейтвей ходит сервис, а не мы.
 * Дизайн: NAUTILUS/docs/superpowers/specs/2026-09-04-lms-llm-service-design.md
 */
export interface LlmEnv {
  LLM_SERVICE_URL: string
  LLM_SERVICE_TOKEN: string
  CF_ACCESS_CLIENT_ID: string
  CF_ACCESS_CLIENT_SECRET: string
}

/** Строго больше внутренних 90s сервиса: иначе наверху виден собственный обрыв, а не причина. */
export const LLM_TIMEOUT_MS = 100_000

export async function callLlm<T>(
  path: string, body: unknown, env: LlmEnv, fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const res = await fetchImpl(`${env.LLM_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Bearer сервиса — заслон самого lms-llm, два CF-заголовка — Access на эдже перед ним.
      'Authorization': `Bearer ${env.LLM_SERVICE_TOKEN}`,
      'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
      'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET,
    },
    // 100s > внутренних 90s сервиса, чтобы отказ был виден с настоящей причиной, а не как обрыв воркера.
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    // Не-2xx — это отказ, а не пустышка: бросаем исключение с кодом ошибки сервиса.
    const detail = await res.json().catch(() => ({})) as any
    throw new Error(`lms-llm ${res.status}: ${detail?.error?.code ?? 'unknown'}`)
  }
  return await res.json() as T
}
