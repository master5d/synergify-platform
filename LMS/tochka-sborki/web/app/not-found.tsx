'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/nav'
import { getDictionary, type Locale } from '@/lib/dictionaries'

export default function NotFound() {
  const pathname = usePathname() || '/'
  const locale: Locale = pathname.startsWith('/en') ? 'en' : 'ru'
  const t = getDictionary(locale)
  const base = locale === 'en' ? '/en' : ''

  return (
    <>
      <Nav locale={locale} />
      <style>{`
        @keyframes glitch-skew { 0%,100%{transform:skewX(0)} 92%{transform:skewX(0)} 94%{transform:skewX(-8deg)} 96%{transform:skewX(6deg)} 98%{transform:skewX(0)} }
        @keyframes glitch-r { 0%,100%{clip-path:inset(0 0 0 0);transform:translate(0)} 93%{clip-path:inset(20% 0 30% 0);transform:translate(4px,-2px)} 96%{clip-path:inset(60% 0 10% 0);transform:translate(-4px,2px)} }
        @keyframes glitch-b { 0%,100%{clip-path:inset(0 0 0 0);transform:translate(0)} 93%{clip-path:inset(50% 0 20% 0);transform:translate(-4px,2px)} 96%{clip-path:inset(10% 0 60% 0);transform:translate(4px,-2px)} }
        .nf-404 { position: relative; display: inline-block; animation: glitch-skew 5s infinite; }
        .nf-404::before, .nf-404::after { content: attr(data-text); position: absolute; inset: 0; }
        .nf-404::before { color: #ff0044; animation: glitch-r 5s infinite; mix-blend-mode: screen; }
        .nf-404::after { color: var(--text-accent); animation: glitch-b 5s infinite; mix-blend-mode: screen; }
        @media (prefers-reduced-motion: reduce) {
          .nf-404, .nf-404::before, .nf-404::after { animation: none; }
          .nf-404::before, .nf-404::after { display: none; }
        }
        @media (max-width: 720px) { .nf-main { padding: 4rem 1.25rem !important; } }
      `}</style>
      <main className="nf-main" style={{
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        padding: '7rem 2rem',
        minHeight: 'calc(100vh - 3rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--section-label-size)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '1.5rem',
        }}>
          {t.notFound.label}
        </div>

        <div
          className="nf-404"
          data-text={t.notFound.code}
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display), system-ui, sans-serif',
            fontSize: 'clamp(6rem, 24vw, 18rem)',
            fontWeight: 900,
            lineHeight: 0.8,
            color: 'var(--text-primary)',
            letterSpacing: '-0.05em',
            marginBottom: '1.5rem',
          }}
        >
          {t.notFound.code}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 'clamp(2.5rem, 8vw, 6rem)',
          fontWeight: 900,
          lineHeight: 0.85,
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '-0.04em',
          whiteSpace: 'pre-line',
          marginBottom: '2rem',
        }}>
          {t.notFound.heading}
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          {t.notFound.body}
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`${base}/`} style={{
            display: 'inline-block',
            padding: '0.875rem 2.5rem',
            background: 'var(--text-accent)',
            color: 'var(--text-on-accent)',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
          }}>
            {t.notFound.ctaHome}
          </Link>
          <Link href={`${base}/#program`} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}>
            {t.notFound.ctaProgram}
          </Link>
        </div>
      </main>
    </>
  )
}
