'use client'

import { useState, useEffect } from 'react'
import { Nav } from '@/components/nav'
import { getDictionary, type Locale } from '@/lib/dictionaries'

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

interface Props { locale: Locale }

export function LoginForm({ locale }: Props) {
  const t = getDictionary(locale).login
  const [email, setEmail] = useState('')
  const [telegram, setTelegram] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [oauthHref, setOauthHref] = useState('/api/auth/oauth/google/start')

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get('redirect')
    setOauthHref(redirect ? `/api/auth/oauth/google/start?redirect=${encodeURIComponent(redirect)}` : '/api/auth/oauth/google/start')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      if (redirect) sessionStorage.setItem('login_redirect', redirect)
      sessionStorage.setItem('login_locale', locale)
      const body: Record<string, string> = { email }
      if (telegram.trim()) body.telegram_handle = telegram.trim()
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign'] as const
      for (const key of utmKeys) {
        const val = params.get(key)
        if (val) body[key] = val
      }
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setStatus('sent')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        setErrorMsg(data.message || data.error || t.defaultError)
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : t.networkError)
    }
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

        {status === 'sent' ? (
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
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              style={inputStyle}
            />
            <input
              type="text"
              value={telegram}
              onChange={e => setTelegram(e.target.value)}
              placeholder={t.telegramPlaceholder}
              style={{ ...inputStyle, borderStyle: 'dashed' }}
            />
            {status === 'error' && (
              <p style={{ color: 'var(--crit)', fontSize: '0.875rem' }}>{errorMsg}</p>
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
