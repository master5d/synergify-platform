// Логика проверки сессии для AuthGuard, вынесена для тестируемости (см. lib/login-flow.ts
// — тот же приём). currentPath — всегда window.location.pathname, т.е. заведомо
// внутренний путь этого сайта: safe-redirect.ts тут не нужен, в отличие от
// login-form.tsx, который читает `redirect` из чужой ссылки.
export type AuthCheckResult =
  | { authed: true }
  | { authed: false; redirectTo: string }

/** `/api/auth/me` не отвечает 200 → на вход, с `?redirect=` на текущий урок, чтобы
 *  вернуться после входа. Сетевой сбой (fetch reject) — та же ссылка на вход с
 *  redirect, а не пустой экран без возврата (intake LMS#16). */
export async function checkAuth(
  fetchImpl: typeof fetch,
  loginBase: string,
  currentPath: string,
): Promise<AuthCheckResult> {
  const redirectTo = `${loginBase}?redirect=${encodeURIComponent(currentPath)}`
  try {
    const res = await fetchImpl('/api/auth/me', { credentials: 'include' })
    if (res.ok) return { authed: true }
    return { authed: false, redirectTo }
  } catch {
    return { authed: false, redirectTo }
  }
}
