'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../lib/registry'
import type { CareFormCopy } from '../lib/care'

const input: React.CSSProperties = {
  width: '100%', padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
  boxSizing: 'border-box',
}
const label: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }
const hint: React.CSSProperties = { color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0.4rem 0 0' }
const field: React.CSSProperties = { marginBottom: '1.5rem' }
const alert: React.CSSProperties = { color: 'var(--crit)', fontSize: 'var(--text-sm)', margin: '0 0 1rem' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Fields = { topic: string; message: string; email: string; pageUrl: string; company: string }

/** Форма службы заботы школы → POST /api/care (воркер; academy.synergify.com/api/* маршрутизирован). */
export function CareForm({ locale, t }: { locale: Locale; t: CareFormCopy }) {
  const [f, setF] = useState<Fields>({ topic: '', message: '', email: '', pageUrl: '', company: '' })
  const [invalid, setInvalid] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'rate-limited' | 'error'>('idle')

  useEffect(() => {
    // Вошедший ученик — email подставляется; страница, откуда пришли (тот же сайт), — в «где случилось».
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: { email?: string }) => {
        const email = typeof d.email === 'string' ? d.email : ''
        if (email) setF((p) => (p.email ? p : { ...p, email }))
      })
      .catch(() => {})
    try {
      const ref = document.referrer
      if (ref && new URL(ref).origin === window.location.origin) setF((p) => (p.pageUrl ? p : { ...p, pageUrl: ref }))
    } catch { /* нет referrer — поле пустое */ }
  }, [])

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const m = f.message.trim()
    const bad = !t.topics.some((x) => x.key === f.topic) || m.length < t.limits.messageMin || !EMAIL_RE.test(f.email.trim())
    setInvalid(bad)
    if (bad) return
    setStatus('loading')
    try {
      const res = await fetch('/api/care', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: 'academy', locale, topic: f.topic, message: m, email: f.email.trim(), pageUrl: f.pageUrl.trim(), company: f.company }),
      })
      setStatus(res.ok ? 'ok' : res.status === 429 ? 'rate-limited' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <p role="status" style={{ border: '1px solid var(--accent)', background: 'var(--accent-wash)', borderRadius: 'var(--radius)', padding: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
        {t.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={field}>
        <label htmlFor="care-topic" style={label}>{t.topicLabel}</label>
        <select id="care-topic" name="topic" value={f.topic} onChange={set('topic')} required style={input}
          aria-describedby={invalid ? 'care-error' : undefined}>
          <option value="">{t.topicPlaceholder}</option>
          {t.topics.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>
      <div style={field}>
        <label htmlFor="care-message" style={label}>{t.messageLabel}</label>
        <textarea id="care-message" name="message" rows={6} value={f.message} onChange={set('message')} required
          maxLength={t.limits.messageMax} aria-describedby="care-message-hint" style={{ ...input, resize: 'vertical' }} />
        <p id="care-message-hint" style={hint}>{t.messageHint}</p>
      </div>
      <div style={field}>
        <label htmlFor="care-email" style={label}>{t.emailLabel}</label>
        <input id="care-email" name="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} required
          aria-describedby="care-email-hint" style={input} />
        <p id="care-email-hint" style={hint}>{t.emailHint}</p>
      </div>
      <div style={field}>
        <label htmlFor="care-page" style={label}>{t.pageUrlLabel}</label>
        <input id="care-page" name="pageUrl" type="url" inputMode="url" value={f.pageUrl} onChange={set('pageUrl')}
          maxLength={t.limits.pageUrlMax} aria-describedby="care-page-hint" style={input} />
        <p id="care-page-hint" style={hint}>{t.pageUrlHint}</p>
      </div>
      {/* Honeypot — скрыт от людей; сервер молча отбрасывает заполненное. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.company} onChange={set('company')}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
      {invalid && <p id="care-error" role="alert" style={alert}>{t.requiredError}</p>}
      {status === 'error' && <p role="alert" style={alert}>{t.error}</p>}
      {status === 'rate-limited' && <p role="alert" style={alert}>{t.rateLimited}</p>}
      <button type="submit" className="a-btn-dark" disabled={status === 'loading'}
        style={{ alignSelf: 'flex-start', padding: '11px 22px', fontSize: '14px', border: 'none', borderRadius: 'var(--radius)', cursor: status === 'loading' ? 'wait' : 'pointer', fontFamily: 'var(--font-body)' }}>
        {status === 'loading' ? t.submitting : t.submit}
      </button>
    </form>
  )
}
