// Cookie сессии школы (вариант A, решение владельца 2026-09-14, intake LMS#16).
// На *.synergify.com сессия ставится на `.synergify.com`: вход на Точке Сборки (ai.) действует и в
// академии (academy.), куда вход открывается после неё. SameSite=Strict остаётся — поддомены одного
// сайта, cookie между ними ходит. Legacy-домены (mamaev.coach) — host-only, как было.
// При входе старая host-only cookie стирается тем же ответом: иначе браузер шлёт две `session=`.

export const SESSION_MAX_AGE = 2592000 // 30 дней

const ATTRS = 'HttpOnly; Secure; SameSite=Strict; Path=/'

/** Домен cookie для хоста запроса: `.synergify.com` для школы, иначе null (host-only). */
export function cookieDomain(host: string): string | null {
  const h = host.toLowerCase()
  return h === 'synergify.com' || h.endsWith('.synergify.com') ? '.synergify.com' : null
}

/** Set-Cookie для входа: сначала стереть host-only (если ставим доменную), затем выдать сессию. */
export function sessionSetCookies(jwt: string, host: string, maxAge = SESSION_MAX_AGE): string[] {
  const domain = cookieDomain(host)
  if (!domain) return [`session=${jwt}; ${ATTRS}; Max-Age=${maxAge}`]
  return [`session=; ${ATTRS}; Max-Age=0`, `session=${jwt}; ${ATTRS}; Max-Age=${maxAge}; Domain=${domain}`]
}

/** Set-Cookie для выхода: стереть и host-only, и доменную. */
export function sessionClearCookies(host: string): string[] {
  const domain = cookieDomain(host)
  const out = [`session=; ${ATTRS}; Max-Age=0`]
  if (domain) out.push(`session=; ${ATTRS}; Max-Age=0; Domain=${domain}`)
  return out
}

/** Добавить набор Set-Cookie в заголовки (несколько Set-Cookie нельзя положить объектом). */
export function appendCookies(headers: Headers, cookies: string[]): Headers {
  for (const c of cookies) headers.append('Set-Cookie', c)
  return headers
}
