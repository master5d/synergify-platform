'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { IS_MIRROR, MIRROR_COPY, isServerOnlyRoute, mainSiteUrl, mirrorLocale } from '@/lib/mirror'
import { installMirrorFetchGuard } from '@/lib/mirror-fetch'
import { MirrorStub } from './mirror-stub'

// Ставится при загрузке модуля — раньше любых эффектов страницы.
if (IS_MIRROR && typeof window !== 'undefined') installMirrorFetchGuard(window)

const DISMISS_KEY = 'mirror_banner_dismissed'

function MirrorBanner({ pathname, locale }: { pathname: string; locale: 'ru' | 'en' }) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    try { setHidden(localStorage.getItem(DISMISS_KEY) === '1') } catch { /* приватный режим */ }
  }, [])
  if (hidden) return null
  return (
    <div data-mirror-banner role="note" style={{
      padding: '0.5rem 1rem', fontSize: '0.85rem', textAlign: 'center',
      background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
    }}>
      {MIRROR_COPY.banner[locale]}{' '}
      <a href={mainSiteUrl(pathname)}>{MIRROR_COPY.bannerLink[locale]}</a>{' '}
      <button type="button" onClick={() => {
        setHidden(true)
        try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* приватный режим */ }
      }} style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
        {MIRROR_COPY.dismiss[locale]}
      </button>
    </div>
  )
}

export function MirrorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  if (!IS_MIRROR) return <>{children}</>
  const locale = mirrorLocale(pathname)
  return (
    <>
      <MirrorBanner pathname={pathname} locale={locale} />
      {isServerOnlyRoute(pathname) ? <MirrorStub pathname={pathname} locale={locale} /> : children}
    </>
  )
}
