'use client'

// Публичная проверка сертификата (intake LMS#17). Static export: код читается из `?c=` на
// клиенте, подпись и завершённость проверяет воркер (/api/certificate/verify). Страница
// показывает ровно то, что вернул воркер, — без email и без имени.
import { useEffect, useState } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import type { Locale } from '@/lib/dictionaries'
import { PLATFORM_API } from '@/lib/platform-api'
import { REGISTRY } from '@/lib/academy/registry'
import { interpretVerify, readVerifyCode, verifiedTransformations, type VerifyResult } from '@/lib/certificate-evidence'

const COPY = {
  ru: {
    label: '/ проверка сертификата',
    loading: 'Проверяем подпись…',
    noCode: 'В адресе нет кода сертификата. Откройте ссылку «Проверить сертификат» целиком — как её дал владелец.',
    invalid: 'Сертификат не подтверждён: подпись не сходится или курс не завершён.',
    error: 'Не удалось связаться с сервером проверки. Попробуйте позже.',
    valid: 'Сертификат подлинный',
    course: 'Курс',
    completed: 'Завершён',
    modules: (n: number) => `Освоено модулей: ${n}`,
    privacy: 'Проверка подтверждает прохождение курса на платформе. Email и имя выпускника она не раскрывает.',
  },
  en: {
    label: '/ certificate check',
    loading: 'Checking the signature…',
    noCode: 'The address has no certificate code. Open the full “Verify certificate” link as the holder shared it.',
    invalid: 'Certificate not confirmed: the signature does not match or the course is not complete.',
    error: 'Could not reach the verification server. Please try again later.',
    valid: 'Certificate is genuine',
    course: 'Course',
    completed: 'Completed',
    modules: (n: number) => `Modules mastered: ${n}`,
    privacy: 'The check confirms course completion on the platform. It does not reveal the graduate’s email or name.',
  },
}

type State = { kind: 'loading' } | { kind: 'no-code' } | { kind: 'error' } | { kind: 'done'; result: VerifyResult }

export function CertificateVerifyPage({ locale }: { locale: Locale }) {
  const t = COPY[locale]
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    const code = readVerifyCode(window.location.search)
    if (!code) { setState({ kind: 'no-code' }); return }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10_000)
    fetch(`${PLATFORM_API}/api/certificate/verify?c=${encodeURIComponent(code)}`, { signal: ctrl.signal })
      .then(async r => {
        const body = await r.json().catch(() => null)
        // 400/404 — законный ответ «не подтверждён»; прочее (5xx) — сбой связи, не вердикт.
        if (r.status >= 500) setState({ kind: 'error' })
        else setState({ kind: 'done', result: interpretVerify(r.status, body) })
      })
      .catch(() => setState({ kind: 'error' }))
      .finally(() => clearTimeout(timer))
    return () => { clearTimeout(timer); ctrl.abort() }
  }, [])

  return (
    <>
      <Nav locale={locale} />
      <main id="main-content" tabIndex={-1} style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '1.5rem',
        }}>
          {t.label}
        </div>
        <div role="status" aria-live="polite">
          {state.kind === 'loading' && <p style={{ color: 'var(--text-secondary)' }}>{t.loading}</p>}
          {state.kind === 'no-code' && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.noCode}</p>}
          {state.kind === 'error' && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.error}</p>}
          {state.kind === 'done' && state.result.state === 'invalid' && (
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>✕ {t.invalid}</p>
          )}
          {state.kind === 'done' && state.result.state === 'valid' && (
            <ValidView locale={locale} result={state.result} />
          )}
        </div>
      </main>
      <Footer locale={locale} showCertificateCta={false} />
    </>
  )
}

function ValidView({ locale, result }: { locale: Locale; result: Extract<VerifyResult, { state: 'valid' }> }) {
  const t = COPY[locale]
  const course = REGISTRY.courses.find(c => c.slug === result.course)
  const lines = verifiedTransformations(result.modules, locale)
  return (
    <section>
      <h1 style={{
        fontFamily: 'var(--font-display), system-ui, sans-serif',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 900,
        lineHeight: 1,
        textTransform: 'uppercase',
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        margin: '0 0 1.5rem',
      }}>
        ✓ {t.valid}
      </h1>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.25rem', margin: '0 0 2rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
        <dt style={{ color: 'var(--text-secondary)' }}>{t.course}</dt>
        <dd style={{ margin: 0, color: 'var(--text-primary)' }}>{course ? course.name[locale] : result.course}</dd>
        <dt style={{ color: 'var(--text-secondary)' }}>{t.completed}</dt>
        <dd style={{ margin: 0, color: 'var(--text-primary)' }}>{result.completedAt.slice(0, 10)}</dd>
      </dl>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.75rem' }}>
        {t.modules(lines.length)}
      </h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {lines.map(l => (
          <li key={l.slug} style={{ borderLeft: '2px solid var(--text-accent)', paddingLeft: '0.875rem', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{l.from}</span>
            <span aria-hidden="true" style={{ color: 'var(--text-accent)' }}> → </span>
            <span style={{ color: 'var(--text-primary)' }}>{l.to}</span>
          </li>
        ))}
      </ol>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: 0 }}>{t.privacy}</p>
    </section>
  )
}
