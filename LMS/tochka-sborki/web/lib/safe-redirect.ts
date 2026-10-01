// Единственный гейт open-redirect для `?redirect=` на клиенте (login-form читает его с URL,
// nav-links прокидывает его в «→ Войти» и EN/RU). Тот же смысл, что у гейтов воркера
// (workers/src/lib/oauth-google.ts:safeRedirectPath, workers/src/lib/return-base.ts):
// только внутренний путь этого сайта — один ведущий `/` (не протокол-относительный `//`),
// без схемы (`://`), без `\`, без пробельных символов и без `..`. Всё остальное — недоверенное:
// ни навигации, ни подсказки в тексте, ни sessionStorage.
const SAFE_INTERNAL_PATH = /^\/(?!\/)[^\s\\]*$/

export function sanitizeInternalPath(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || raw === '') return null
  if (!SAFE_INTERNAL_PATH.test(raw)) return null
  if (raw.includes('://') || raw.includes('..')) return null
  return raw
}
