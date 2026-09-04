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

/** Извлекает последнее сбалансированное JSON-значение из текста.
 * Думающие модели сначала рассуждают прозой, а затем пишут JSON в конце.
 * Ищет сбалансированное { или [ с конца текста, учитывая строки и экранирование.
 * Возвращает найденное значение или null, если JSON нет. */
export function extractJsonFromText(text: string): string | null {
  let depth = 0
  let inString = false
  let startPos = -1

  // Идём с конца текста к началу, считая скобки в обратном направлении
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i]

    // Обработка экранирования (в обратном направлении нужно проверить предыдущий символ)
    if (char === '"') {
      // Проверим, экранирована ли эта кавычка
      let escapeCount = 0
      for (let j = i - 1; j >= 0 && text[j] === '\\'; j--) {
        escapeCount++
      }
      // Если нечётное число бэкслешей перед кавычкой — она экранирована
      if (escapeCount % 2 === 0) {
        inString = !inString
      }
      continue
    }

    // Если внутри строки, пропускаем скобки
    if (inString) continue

    // Считаем скобки вне строк (в обратном направлении закрывающие становятся открывающими)
    if (char === '}' || char === ']') {
      depth++
    } else if (char === '{' || char === '[') {
      depth--
      if (depth === 0) {
        // Нашли открывающую скобку на уровне 0 — это начало JSON
        startPos = i
        break
      }
    }
  }

  if (startPos === -1) return null

  // Теперь идём вперёд от startPos, считая скобки в нормальном направлении
  depth = 0
  inString = false
  // М-3 финального ревью: escapeNext теперь объявляется только здесь (в обратном проходе
  // выше он не читался вовсе) — к моменту проверки char === '"' ниже экранирование уже
  // обработано веткой if (escapeNext), так что там было всегда истинно.
  let escapeNext = false

  for (let i = startPos; i < text.length; i++) {
    const char = text[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\' && inString) {
      escapeNext = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{' || char === '[') {
      depth++
    } else if (char === '}' || char === ']') {
      depth--
      if (depth === 0) {
        return text.slice(startPos, i + 1)
      }
    }
  }

  return null
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
  let data: any
  try {
    data = await res.json()
  } catch {
    // Гейтвей ответил 200, но телом не JSON — например, HTML от прокси на пути.
    // Это отказ ТРАНСПОРТА, а не плохой ответ модели, поэтому gateway_error, не unparsable:
    // «не смогли получить ответ» и «получили плохой ответ» — разные утверждения.
    throw new LlmError('gateway_error', 'gateway response body is not JSON')
  }
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw new LlmError('unparsable', 'gateway returned no content')
  }

  // Сначала пытаемся разобрать напрямую (оптимальный путь для чистого JSON и ```-забора)
  const stripped = stripFence(text)
  try {
    return JSON.parse(stripped)
  } catch {
    // Запасной путь: если в тексте есть рассуждение, вытащим JSON из конца
    const extracted = extractJsonFromText(stripped)
    if (extracted) {
      try {
        return JSON.parse(extracted)
      } catch {
        // Даже извлечённый JSON не парсится — это ошибка модели
        throw new LlmError('unparsable', 'model output is not valid JSON')
      }
    }
    // JSON в тексте не найден вообще
    throw new LlmError('unparsable', 'model output is not valid JSON')
  }
}
