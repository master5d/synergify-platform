'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { detectOs, readStoredOs, storeOs, type Os } from '@/lib/os-pref'
import { activeEasterEgg, type EasterEgg } from '@/lib/easter-eggs'
import { useRpgMode } from '@/lib/use-rpg-mode'
import { pagePath } from '@/lib/base-path'
import { secondaryNavLinks, withRedirectParam } from '@/lib/nav-links'
import { SkipLink } from '@/components/skip-link'
import { SettingsMenu } from '@/components/settings-menu'
import { NavMobileMenu } from '@/components/nav-mobile-menu'
import { COURSE } from '@/lib/course'

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
  // `?redirect=` текущего URL — только для сохранения при переключении языка на
  // странице входа (window.location, а не useSearchParams: Nav рендерится на
  // ~30 страницах без общего Suspense-каркаса, заводить его ради одного поля — лишнее).
  const [redirectParam, setRedirectParam] = useState<string | null>(null)

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

  useEffect(() => {
    try {
      setRedirectParam(new URLSearchParams(window.location.search).get('redirect'))
    } catch {
      setRedirectParam(null)
    }
  }, [pathname])

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
  // На странице 404 путь — служебный `/_not-found`: переключатель вёл на `/en/_not-found/` (снова 404).
  // Там язык меняем на главную нужной локали.
  const langPath = pathname.includes('_not-found') ? (detected === 'en' ? '/en/' : '/') : pathname
  const otherHrefBase = otherLocale === 'en'
    ? '/en' + (langPath === '/' ? '/' : langPath.replace(/^\/en(\/|$)/, '/'))
    : langPath.replace(/^\/en(\/|$)/, '/') || '/'
  // На странице входа с ?redirect= переключение языка не должно терять контекст —
  // без этого EN/RU уводил на другую локаль главной, а не туда, откуда пришли за входом.
  const otherHref = withRedirectParam(otherHrefBase, redirectParam)

  // Active-link detection (next.config has trailingSlash: true, so paths end with /)
  const normalize = (p: string) => p.replace(/\/+$/, '') || '/'
  const here = normalize(pathname)
  const isActive = (href: string) => here === normalize(href)
  const loginPath = `${locale === 'en' ? '/en' : ''}/login/`
  const isLoginPage = isActive(loginPath)
  // pagePath, а не сырой pathname: `redirect` уходит в OAuth-callback и auth-guard,
  // которые ждут путь с basePath пака (intake LMS#16, вариант A).
  const loginHref = withRedirectParam(loginPath, pagePath(pathname))
  const questLogLabel = plain('navQuestLog', t.nav.questLog)
  const links = secondaryNavLinks({
    locale,
    email,
    features: { rpg: COURSE.features.rpg, certificate: COURSE.features.certificate },
    nav: t.nav,
    questLogLabel,
  })
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

        /* Бургер — замена полосе ссылок только на ≤720px (см. ниже); на десктопе
           не показывается и ничего не меняет (BACKLOG «Мобильная навигация без меню»). */
        .nav-mobile-menu { display: none; }

        @media (max-width: 720px) {
          .nav-secondary-links { display: none !important; }
          .nav-mobile-menu { display: flex !important; }
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
        {links.map((l) => (
          <Link key={l.key} href={l.href} style={navLinkStyle(l.href)}>
            {l.label}{l.deco ? <> <span aria-hidden="true">{l.deco}</span></> : null}
          </Link>
        ))}
        </div>

        {/* Бургер: та же полоса ссылок, что и выше, только свёрнутая для ≤720px —
            туда, где .nav-secondary-links скрыт. Список общий (lib/nav-links.ts),
            поэтому мобильное меню не может показать больше пунктов, чем десктоп. */}
        <NavMobileMenu links={links} isActive={isActive} label={t.nav.menu} />

        {/* Language switcher */}
        <Link
          href={otherHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '24px',
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
        ) : !isLoginPage ? (
          // На самой странице входа ссылка на неё саму лишняя — скрыта, а не просто неактивна
          // (иначе перед ней всё равно нужно было бы объяснять, почему клик никуда не ведёт).
          // redirect тут — путь, откуда пришли (withRedirectParam режет всё внешнее).
          <Link
            href={loginHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '24px',
              color: 'var(--text-accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {t.nav.login}
          </Link>
        ) : null}
      </div>
    </nav>
    </>
  )
}
