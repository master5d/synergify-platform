// Логика отправки magic-link, вынесена из login-form.tsx для тестируемости
// (compare: lib/self-check.ts рядом с components/self-check.tsx) — репо не ставит
// jsdom/testing-library, тесты компонентов рендерят только статику
// (react-dom/server), а сетевые сценарии (reject/коды ответа) проверяются на этой
// чистой функции с подставным fetch.
import type { Dictionary } from './dictionaries'

export interface SendLinkErrorBody {
  error?: string
  message?: string
}

/** Известные коды `/api/auth/send-link` (workers/src/handlers/auth.ts) → локализованная
 *  строка. Сырой ответ сервера (SES-код, машинный текст) студенту не показываем —
 *  неизвестный код тоже уходит в t.defaultError, а не в текст ошибки как есть. */
export function mapSendLinkError(status: number, body: SendLinkErrorBody, t: Dictionary['login']): string {
  if (status === 429) return t.rateLimited
  switch (body.error) {
    case 'Valid email required': return t.invalidEmail
    case 'Failed to send email': return t.sendFailed
    default: return t.defaultError
  }
}

export type SendLinkResult = { ok: true } | { ok: false; message: string }

/** Отправка magic-link. Сетевой сбой (fetch reject: «Failed to fetch» и т.п.) всегда
 *  даёт t.networkError — текст исключения студенту не показываем. */
export async function sendLoginLink(
  fetchImpl: typeof fetch,
  body: Record<string, unknown>,
  t: Dictionary['login'],
): Promise<SendLinkResult> {
  try {
    const res = await fetchImpl('/api/auth/send-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) return { ok: true }
    const data: SendLinkErrorBody = await res.json().catch(() => ({}))
    return { ok: false, message: mapSendLinkError(res.status, data, t) }
  } catch {
    return { ok: false, message: t.networkError }
  }
}
