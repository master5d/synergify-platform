'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { pagePath } from '@/lib/base-path'
import { IS_MIRROR } from '@/lib/mirror'

// Зеркало (GitHub Pages): входа/допуска нет, юниты открыты — см. lib/mirror.ts.
export function IntakeGuard(props: { children: React.ReactNode; locale?: Locale }) {
  if (IS_MIRROR) return <>{props.children}</>
  return <IntakeGuardLive {...props} />
}

function IntakeGuardLive({ children, locale = 'ru' }: { children: React.ReactNode; locale?: Locale }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const base = pagePath(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/')
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.status === 'completed') setReady(true); else window.location.replace(base) })
      .catch(() => window.location.replace(base))
  }, [locale])
  if (!ready) return null
  return <>{children}</>
}
