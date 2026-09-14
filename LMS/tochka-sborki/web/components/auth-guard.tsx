'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { pagePath } from '@/lib/base-path'

export function AuthGuard({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // window.location не знает про basePath: без pagePath курс в подпути (/praktika) уводил
    // на /login/ корня домена школы — 404 вместо входа на всех уроках (intake LMS#16).
    // ?redirect= остаётся полным путём (с префиксом): его ждёт OAuth-callback (origin + path).
    const loginBase = pagePath(locale === 'en' ? '/en/login/' : '/login/')
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          setAuthed(true)
        } else {
          const redirect = encodeURIComponent(window.location.pathname)
          window.location.replace(`${loginBase}?redirect=${redirect}`)
        }
      })
      .catch(() => {
        window.location.replace(loginBase)
      })
  }, [locale])

  if (!authed) return null

  return <>{children}</>
}
