// Путевой префикс курса (Ф4 S2).
//
// `basePath` в next.config переписывает next/link и импортированные ассеты, но НЕ
// трогает сырые строки вида "/author.jpg" и не помогает сервис-воркеру. Для них —
// эти два помощника. Значение приходит из COURSE_BASE_PATH на сборке и инлайнится
// в бандл, поэтому клиентский код им пользуется без обращения к env в рантайме.
export const BASE_PATH = (process.env.NEXT_PUBLIC_COURSE_BASE_PATH ?? '').replace(/\/$/, '')

/** Абсолютный путь к файлу из public/ с учётом префикса курса. */
export function assetPath(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${clean}`
}

/**
 * Путь страницы курса для СЫРОЙ навигации — `window.location.*` и `<a href>`: их basePath
 * не переписывает (в отличие от next/link и router). Без префикса курс в подпути уводил
 * студента на корень домена школы: `/login/` вместо `/praktika/login/` → 404 (intake LMS#16).
 */
export function pagePath(path: string): string {
  return assetPath(path)
}
