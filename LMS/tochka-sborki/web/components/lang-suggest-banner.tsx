'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { dictionaries, type Locale } from '@/lib/dictionaries'

const PREF_KEY = 'lang-preference'

function currentLocale(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ru'
}

function browserPrefersRussian(): boolean {
  if (typeof navigator === 'undefined') return false
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  // Match anything starting with 'ru' (ru, ru-RU, ru-BY, etc.). Anything else (en, zh, de…) → not RU.
  return langs.some(l => l?.toLowerCase().startsWith('ru'))
}

function switchedPath(pathname: string, from: Locale, to: Locale): string {
  if (from === to) return pathname
  if (to === 'en') {
    // Going RU → EN: prepend /en. Special-case root.
    if (pathname === '/') return '/en/'
    return '/en' + pathname
  }
  // Going EN → RU: strip the /en prefix.
  if (pathname === '/en' || pathname === '/en/') return '/'
  return pathname.replace(/^\/en(\/|$)/, '/') || '/'
}

export function LangSuggestBanner() {
  const pathname = usePathname() || '/'
  const locale = currentLocale(pathname)
  const otherLocale: Locale = locale === 'ru' ? 'en' : 'ru'
  const t = dictionaries[locale].langSuggest

  const [show, setShow] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(PREF_KEY) } catch { /* ignore */ }
    // If user already made a choice — never show again
    if (stored === 'ru' || stored === 'en' || stored === 'dismissed') {
      setShow(false)
      return
    }
    const prefersRu = browserPrefersRussian()
    // Show banner only if browser locale doesn't match current page locale.
    //  - On RU page (locale='ru') + browser NOT-RU  → suggest EN
    //  - On EN page (locale='en') + browser IS-RU   → suggest RU
    const mismatch = (locale === 'ru' && !prefersRu) || (locale === 'en' && prefersRu)
    setShow(mismatch)
  }, [locale])

  function handleSwitch() {
    try { localStorage.setItem(PREF_KEY, otherLocale) } catch { /* ignore */ }
    window.location.href = switchedPath(pathname, locale, otherLocale)
  }

  function handleDismiss() {
    try { localStorage.setItem(PREF_KEY, 'dismissed') } catch { /* ignore */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      role="region"
      aria-label="Language suggestion"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85rem',
      }}
    >
      <style>{`
        @media (max-width: 720px) {
          .lang-suggest-message { font-size: 0.8rem !important; text-align: center; flex-basis: 100%; }
        }
      `}</style>
      <span className="lang-suggest-message" style={{ color: 'var(--text-primary)' }}>
        {t.message}
      </span>
      <button
        type="button"
        onClick={handleSwitch}
        style={{
          padding: '0.4rem 0.85rem',
          background: 'var(--text-accent)',
          color: 'var(--text-on-accent)',
          border: '1px solid var(--text-accent)',
          borderRadius: '3px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        {t.switchAction}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        style={{
          padding: '0.4rem 0.75rem',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '3px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          cursor: 'pointer',
        }}
      >
        {t.dismissAction}
      </button>
    </div>
  )
}
