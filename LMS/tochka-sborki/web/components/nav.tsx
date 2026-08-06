'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { detectOs, readStoredOs, storeOs, type Os } from '@/lib/os-pref'
import { activeEasterEgg, type EasterEgg } from '@/lib/easter-eggs'
import { useRpgMode } from '@/lib/use-rpg-mode'
import { SkipLink } from '@/components/skip-link'
import { SettingsMenu } from '@/components/settings-menu'

interface Props { locale?: Locale }

export function Nav({ locale: localeProp }: Props = {}) {
  const pathname = usePathname() || '/'
  const detected: Locale = pathname.startsWith('/en') ? 'en' : 'ru'
  const locale = localeProp ?? detected
  const t = getDictionary(locale)
  const { plain } = useRpgMode(locale)

  const [email, setEmail] = useState<string | null>(null)
  const [os, setOs] = useState<Os | null>(null)
  // Date-driven easter egg — computed client-side to avoid SSR/hydration date drift.
  const [egg, setEgg] = useState<EasterEgg | null>(null)

  useEffect(() => {
    setEgg(activeEasterEgg())
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.email) setEmail(d.email) })
      .catch(() => {})
    // Show the saved choice, or auto-detect — so the toggle appears for everyone,
    // not only after a visit to the cheatsheet has stored a value.
    setOs(readStoredOs() ?? detectOs())
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setEmail(null)
    window.location.replace(locale === 'en' ? '/en/' : '/')
  }

  function toggleOs() {
    const next = os === 'mac' ? 'windows' : 'mac'
    storeOs(next)
    setOs(next)
    window.location.reload()
  }

  const homeHref = locale === 'en' ? '/en/' : '/'
  const otherLocale: Locale = locale === 'en' ? 'ru' : 'en'
  const otherHref = otherLocale === 'en'
    ? '/en' + (pathname === '/' ? '/' : pathname)
    : pathname.replace(/^\/en(\/|$)/, '/') || '/'

  // Active-link detection (next.config has trailingSlash: true, so paths end with /)
  const normalize = (p: string) => p.replace(/\/+$/, '') || '/'
  const here = normalize(pathname)
  const isActive = (href: string) => here === normalize(href)
  const navLinkStyle = (href: string): React.CSSProperties => {
    const active = isActive(href)
    return {
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      borderBottom: active ? '2px solid var(--text-accent)' : '2px solid transparent',
      paddingBottom: '1px',
      textDecoration: 'none',
      fontWeight: active ? 600 : 400,
    }
  }

  return (
    <>
      <SkipLink locale={locale} />
      <nav style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '0 1.5rem',
      height: '3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <style>{`
        /* Устойчивый макет шапки на любой ширине.
         *
         * Раньше правила жили только в брейкпоинте 721-1280, и на широком экране
         * шапка распирала СТРАНИЦУ: у авторизованного пользователя в английской
         * версии пунктов больше (My lessons / Profile / Synergems) и слова длиннее,
         * а служебные переключатели справа занимают ~460px и не сжимаются.
         * Итог — горизонтальный скролл всего документа (владелец прислал скриншот
         * на ~1900px: «Certificate» обрезан, полоса прокрутки внизу).
         *
         * Теперь переполняется ТОЛЬКО полоса ссылок: она и растягивается, и
         * ужимается, и прокручивается сама. Страница не едет никогда.
         */
        nav > a:first-of-type { flex: 0 0 auto; }
        nav > div:last-of-type { display: flex; min-width: 0; flex: 1 1 auto; justify-content: flex-end; }
        .nav-secondary-links {
          flex: 1 1 auto;
          min-width: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .nav-secondary-links::-webkit-scrollbar { display: none; }
        .nav-secondary-links a { white-space: nowrap; }
        /* Когда пункты не помещаются, край полосы затухает — обрезанное слово
           читается как «здесь есть продолжение», а не как поломка вёрстки
           (на скриншоте владельца «Сертификат» обрывался без всякого намёка). */
        .nav-secondary-links {
          mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent 100%);
        }
        /* Служебные переключатели (язык, тема, режим, вход) не сжимаются в кашу:
           их ширина предсказуема, ужимать нужно навигацию, а не элементы управления. */
        nav > div:last-of-type > *:not(.nav-secondary-links) { flex: 0 0 auto; }

        @media (max-width: 720px) {
          .nav-secondary-links { display: none !important; }
          .nav-brand-glyph { display: none !important; }
          /* Правая группа (язык + 4 переключателя + вход) занимала 522px при
             экране 390 и распирала страницу горизонтальным скроллом. Даём ей
             переноситься и снимаем фиксированную высоту шапки. */
          nav { height: auto !important; flex-wrap: wrap; padding: 0.5rem 1rem !important; row-gap: 0.5rem; }
          nav > div:last-of-type { flex-wrap: wrap; gap: 0.6rem !important; justify-content: flex-end; }
          nav > div:last-of-type > span { max-width: 46vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        }
        /* Средние экраны: пунктов стало больше, чем влезает (на 1200px шапка
           переполнялась на 140px и добавляла странице горизонтальный скролл).
           Ужимаем зазоры и кегль, а остаток отдаём в горизонтальную прокрутку
           самой полосы ссылок — страница при этом не едет. */
        /* Средние экраны: дополнительно ужимаем зазоры и кегль — прокрутка полосы
           остаётся, но до неё доходит реже. */
        @media (min-width: 721px) and (max-width: 1280px) {
          .nav-secondary-links { gap: 0.9rem !important; font-size: var(--text-xs); }
          nav { padding: 0 1rem !important; gap: 0.75rem !important; }
          nav > div:last-of-type { gap: 0.6rem !important; }
        }
      `}</style>
      <Link href={homeHref} style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>
        <span className="nav-brand-glyph" aria-hidden="true" title={egg?.label[locale] ?? undefined}>{egg ? egg.glyph : '⬡'} </span>{t.nav.brand}
      </Link>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', alignItems: 'center' }}>
        <div className="nav-secondary-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', minWidth: 0 }}>
        {email && (() => { const h = `${locale === 'en' ? '/en' : ''}/dashboard/`; return <Link href={h} style={navLinkStyle(h)}>{plain('navQuestLog', t.nav.questLog)}</Link> })()}
        {email && (() => { const h = `${locale === 'en' ? '/en' : ''}/character/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.profile}</Link> })()}
        {email && (() => { const h = `${locale === 'en' ? '/en' : ''}/alumni/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.synergems}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/syllabus/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.syllabus}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/roadmap/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.roadmap}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/cheatsheet/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.cheatsheet}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/speedreading/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.speedreading}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/feedback/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.feedback}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/support/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.support}</Link> })()}
        {(() => { const h = `${locale === 'en' ? '/en' : ''}/certificate/`; return <Link href={h} style={navLinkStyle(h)}>{t.nav.certificate} <span aria-hidden="true">◆</span></Link> })()}
        </div>

        {/* Language switcher */}
        <Link
          href={otherHref}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '3px',
            padding: '2px 6px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {otherLocale === 'en' ? 'EN' : 'RU'}
        </Link>

        {/* Тема, режим подачи, экономия трафика и выбор системы свёрнуты в одну
            кнопку: это настройки, их трогают однажды, а места они занимали
            больше, чем вся навигация курса (~460px из шапки). */}
        <SettingsMenu
          locale={locale}
          os={os}
          onToggleOs={toggleOs}
          osTitle={t.nav.osTitle}
          osLabel={os ? t.nav.osCurrent(os) : t.nav.osTitle}
        />

        {email ? (
          <>
            {/* Полный адрес занимал в шапке 158px и выдавливал «Сертификат»
                за край. Показываем часть до @ (этого хватает, чтобы понять,
                под кем вошёл), полный — в подсказке и для скринридера. */}
            <span
              title={email}
              style={{
                color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)', maxWidth: '12ch', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >
              {email.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {t.nav.logout}
            </button>
          </>
        ) : (
          <Link href={`${locale === 'en' ? '/en' : ''}/login/`} style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{t.nav.login}</Link>
        )}
      </div>
    </nav>
    </>
  )
}
