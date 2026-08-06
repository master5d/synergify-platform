'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/intake/types'

export function IntakeGuard({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const base = locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.status === 'completed') setReady(true); else window.location.replace(base) })
      .catch(() => window.location.replace(base))
  }, [locale])
  if (!ready) return null
  return <>{children}</>
}
