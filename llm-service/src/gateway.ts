import { LlmError } from './errors.js'

export { LlmError } from './errors.js'

export interface GatewayEnv { GATEWAY_URL: string; GATEWAY_API_KEY: string }

export const GATEWAY_TIMEOUT_MS = 90_000
/** Думающие модели тратят часть лимита на рассуждение: с 900 ответ обрывался на середине строки. */
export const MAX_TOKENS = 4000

/** Некоторые пулы оборачивают JSON в ```-блок; голый JSON.parse такой ответ не примет. */
export function stripFence(text: string): string {
  const s = text.trim()
  if (!s.startsWith('```')) return s
  const withoutOpen = s.replace(/^```[a-zA-Z]*\r?\n?/, '')
  return withoutOpen.replace(/\r?\n?```$/, '').trim()
}

export async function chatJson(opts: {
  pool: string; prompt: string; env: GatewayEnv; fetchImpl?: typeof fetch
}): Promise<unknown> {
  const { pool, prompt, env } = opts
  const fetchImpl = opts.fetchImpl ?? fetch
  let res: Response
  try {
    res = await fetchImpl(`${env.GATEWAY_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.GATEWAY_API_KEY}` },
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
      body: JSON.stringify({
        model: pool,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: MAX_TOKENS,
      }),
    }) as Response
  } catch (e) {
    const name = e instanceof Error ? e.name : ''
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new LlmError('timeout', `gateway timeout after ${GATEWAY_TIMEOUT_MS}ms`)
    }
    throw new LlmError('gateway_unreachable', 'gateway unreachable')
  }
  if (!res.ok) throw new LlmError('gateway_error', `gateway returned ${res.status}`)
  const data = await res.json() as any
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new LlmError('unparsable', 'gateway returned no content')
  }
  try {
    return JSON.parse(stripFence(text))
  } catch {
    throw new LlmError('unparsable', 'model output is not valid JSON')
  }
}
