'use client'

import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { pagePath } from '@/lib/base-path'
import { checkAuth } from '@/lib/auth-check'

export function AuthGuard({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [authed, setAuthed] = useState(false)
  const t = getDictionary(locale).authGuard

  useEffect(() => {
    // window.location не знает про basePath: без pagePath курс в подпути (/praktika) уводил
    // на /login/ корня домена школы — 404 вместо входа на всех уроках (intake LMS#16).
    // ?redirect= остаётся полным путём (с префиксом): его ждёт OAuth-callback (origin + path).
    // currentPath — всегда window.location.pathname, т.е. заведомо внутренний путь: чужого
    // ввода тут нет, safe-redirect.ts (нужен login-form.tsx) тут не при чём.
    const loginBase = pagePath(locale === 'en' ? '/en/login/' : '/login/')
    checkAuth(fetch, loginBase, window.location.pathname).then(result => {
      if (result.authed) {
        setAuthed(true)
      } else {
        // Сетевой сбой (catch) раньше терял ?redirect= — ученик после входа не возвращался
        // в урок (intake LMS#16). checkAuth() отдаёт ссылку с redirect и на reject, и на
        // не-2xx ответ — сюда попадает уже готовая ссылка в обоих случаях.
        window.location.replace(result.redirectTo)
      }
    })
  }, [locale])

  if (!authed) {
    return (
      <p
        role="status"
        aria-live="polite"
        aria-busy="true"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
        }}
      >
        {t.checking}
      </p>
    )
  }

  return <>{children}</>
}
