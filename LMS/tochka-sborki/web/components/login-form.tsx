'use client'

import { useState, useEffect, useId } from 'react'
import { Nav } from '@/components/nav'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { BASE_PATH } from '@/lib/base-path'
import { sanitizeInternalPath } from '@/lib/safe-redirect'
import { sendLoginLink } from '@/lib/login-flow'

const inputStyle = {
  padding: '0.875rem',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  fontFamily: 'var(--font-mono)',
  width: '100%',
  boxSizing: 'border-box' as const,
}

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '0.375rem',
}

const fieldHintStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  marginTop: '0.375rem',
  marginBottom: 0,
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--text-accent)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  textDecoration: 'underline',
  cursor: 'pointer',
}

interface Props { locale: Locale }

export function LoginForm({ locale }: Props) {
  const t = getDictionary(locale).login
  const emailId = useId()
  const telegramId = useId()
  const telegramHintId = useId()
  const [email, setEmail] = useState('')
  const [telegram, setTelegram] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [resending, setResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [oauthHref, setOauthHref] = useState('/api/auth/oauth/google/start')
  // Валидный только внутренний путь (lib/safe-redirect.ts — тот же гейт, что у OAuth-старта на
  // воркере): чужая ссылка на /login/?redirect=https://evil не должна ни попасть в OAuth-запрос,
  // ни лечь в sessionStorage, ни показаться в подсказке ниже.
  const [redirect, setRedirect] = useState<string | null>(null)

  useEffect(() => {
    // base — префикс курса в подпути (/praktika): воркер вернёт ошибку/дефолт на вход и главную курса,
    // а не на корень домена школы (intake LMS#16, вариант A).
    const rawRedirect = new URLSearchParams(window.location.search).get('redirect')
    const safeRedirect = sanitizeInternalPath(rawRedirect)
    setRedirect(safeRedirect)
    const params = new URLSearchParams()
    if (safeRedirect) params.set('redirect', safeRedirect)
    if (BASE_PATH) params.set('base', BASE_PATH)
    const qs = params.toString()
    setOauthHref(`/api/auth/oauth/google/start${qs ? `?${qs}` : ''}`)
  }, [])

  function buildBody(currentEmail: string, currentTelegram: string): Record<string, string> {
    // return_to — адрес сайта ЭТОГО курса: ссылка из письма приведёт сюда же (воркер сверяет с LMS/registry.json).
    const body: Record<string, string> = { email: currentEmail, return_to: `${window.location.origin}${BASE_PATH}` }
    if (currentTelegram.trim()) body.telegram_handle = currentTelegram.trim()
    const params = new URLSearchParams(window.location.search)
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'] as const
    for (const key of utmKeys) {
      const val = params.get(key)
      if (val) body[key] = val
    }
    return body
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setErrorMsg('')
    const result = await sendLoginLink(fetch, buildBody(email, telegram), t)
    if (result.ok) {
      if (redirect) sessionStorage.setItem('login_redirect', redirect)
      sessionStorage.setItem('login_locale', locale)
      setStatus('sent')
    } else {
      setStatus('error')
      setErrorMsg(result.message)
    }
  }

  async function handleResend() {
    if (resending) return
    setResending(true)
    setResendError('')
    const result = await sendLoginLink(fetch, buildBody(email, telegram), t)
    if (!result.ok) setResendError(result.message)
    setResending(false)
  }

  function handleChangeEmail() {
    setStatus('idle')
    setErrorMsg('')
    setResendError('')
  }

  return (
    <>
      <Nav locale={locale} />
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '6rem 2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '1rem',
        }}>
          {t.label}
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          lineHeight: 0.95,
          marginBottom: '1.5rem',
          whiteSpace: 'pre-line',
        }}>
          {t.heading}
        </h1>

        {status !== 'sent' && redirect && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>
            {t.redirectHint}
          </p>
        )}

        {status === 'sent' ? (
          <>
            <div style={{
              padding: '1.5rem',
              border: '1px solid var(--text-accent)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
            }}>
              {t.sentConfirm(email)}
            </div>
            {resendError && (
              <p role="alert" style={{ color: 'var(--crit)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{resendError}</p>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleChangeEmail} style={linkButtonStyle}>{t.changeEmail}</button>
              <button type="button" onClick={handleResend} disabled={resending} style={{ ...linkButtonStyle, cursor: resending ? 'wait' : 'pointer' }}>
                {resending ? t.sending : t.resend}
              </button>
            </div>
          </>
        ) : (
          <>
            <a
              href={oauthHref}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.875rem 2rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              {t.google}
            </a>
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
              {t.or}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor={emailId} style={fieldLabelStyle}>{t.emailLabel}</label>
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor={telegramId} style={fieldLabelStyle}>{t.telegramLabel}</label>
              <input
                id={telegramId}
                name="telegram"
                type="text"
                aria-describedby={telegramHintId}
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder={t.telegramPlaceholder}
                style={{ ...inputStyle, borderStyle: 'dashed' }}
              />
              <p id={telegramHintId} style={fieldHintStyle}>{t.telegramHint}</p>
            </div>
            {status === 'error' && (
              <p role="alert" style={{ color: 'var(--crit)', fontSize: '0.875rem' }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                padding: '0.875rem 2rem',
                background: 'var(--text-accent)',
                color: 'var(--text-on-accent)',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                borderRadius: 'var(--radius)',
                border: 'none',
                cursor: status === 'loading' ? 'wait' : 'pointer',
              }}
            >
              {status === 'loading' ? t.sending : t.submit}
            </button>
          </form>
          </>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {t.footnote}
        </p>
      </main>
    </>
  )
}
