'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { isIos, isInStandaloneMode } from '@/lib/pwa'

const DISMISS_KEY = 'pwa_install_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** Dismissible install affordance: native prompt on Chrome/Edge, manual hint on iOS Safari. */
export function InstallPrompt() {
  const pathname = usePathname() || '/'
  const locale: Locale = pathname.startsWith('/en') ? 'en' : 'ru'
  const t = getDictionary(locale).pwa

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    let dismissed = false
    try { dismissed = localStorage.getItem(DISMISS_KEY) === '1' } catch { /* ignore */ }
    if (dismissed || isInStandaloneMode()) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setHidden(false)
    }
    const onInstalled = () => { setHidden(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    // iOS Safari fires no beforeinstallprompt — offer the manual hint instead.
    if (isIos()) { setIosHint(true); setHidden(false) }

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (hidden) return null

  const dismiss = () => {
    setHidden(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }
  const install = async () => {
    if (!deferred) return
    setInstalling(true)
    try { await deferred.prompt(); await deferred.userChoice } catch { /* ignore */ }
    setInstalling(false)
    setHidden(true)
    setDeferred(null)
  }

  return (
    <div style={{ position: 'fixed', left: '1.25rem', bottom: '1.25rem', zIndex: 50, maxWidth: '20rem',
      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem',
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
      {iosHint ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {t.iosHint}
        </span>
      ) : (
        <button type="button" onClick={install} disabled={installing}
          style={{ border: 'none', cursor: installing ? 'default' : 'pointer', padding: '0.4rem 0.7rem',
            background: 'var(--text-accent)', color: 'var(--text-on-accent)', borderRadius: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
          {installing ? t.installing : t.install}
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label={t.dismiss}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', padding: '0 0.2rem' }}>
        ×
      </button>
    </div>
  )
}
