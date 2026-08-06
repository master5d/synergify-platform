'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/dictionaries'

export function AuthGuard({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const loginBase = locale === 'en' ? '/en/login/' : '/login/'
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
