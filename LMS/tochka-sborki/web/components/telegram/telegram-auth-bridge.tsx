'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { getTelegramWebApp, isInsideTelegram } from '@/lib/telegram/webapp'

// Auto-authenticates the LMS when it runs inside Telegram as a Mini App.
// Outside Telegram it renders nothing and does nothing.
export function TelegramAuthBridge() {
  const pathname = usePathname() || '/'
  const locale: Locale = pathname.startsWith('/en') ? 'en' : 'ru'
  const t = getDictionary(locale)
  const [bridging, setBridging] = useState(false)

  useEffect(() => {
    if (!isInsideTelegram()) return
    const app = getTelegramWebApp()
    if (!app) return
    app.ready()
    app.expand()

    let cancelled = false
    ;(async () => {
      // Already signed in? Then nothing to do.
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (me.ok) return
      } catch { /* fall through to bridge attempt */ }

      if (cancelled) return
      setBridging(true)
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: app.initData }),
        })
        if (res.ok && !cancelled) {
          // Re-render the app with the fresh session cookie applied.
          window.location.reload()
          return
        }
      } catch { /* fall through — show the normal LMS (email login) */ }
      if (!cancelled) setBridging(false)
    })()

    return () => { cancelled = true }
  }, [])

  if (!bridging) return null
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)', fontSize: '0.875rem',
      }}
    >
      {t.telegram.signingIn}
    </div>
  )
}
