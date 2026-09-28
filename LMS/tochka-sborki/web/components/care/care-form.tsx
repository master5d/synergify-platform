'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/dictionaries'
import {
  careCopy, careTopics, validateCareFields, fetchCareEmail, submitCare, CARE,
  type CareFields, type CareSite,
} from '@/lib/care'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.875rem',
  boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }
const hintStyle: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.4rem 0 0' }
const fieldStyle: React.CSSProperties = { marginBottom: '1.5rem' }

export function CareForm({ locale = 'ru', site }: { locale?: Locale; site: CareSite }) {
  const t = careCopy(locale)
  const topics = careTopics(locale)
  const [fields, setFields] = useState<CareFields>({ topic: '', message: '', email: '', pageUrl: '', company: '' })
  const [invalid, setInvalid] = useState<(keyof CareFields)[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'rate-limited' | 'error'>('idle')

  useEffect(() => {
    // Вошедший ученик — email подставляется; страница, откуда пришли (тот же сайт), — в «где случилось».
    fetchCareEmail(fetch).then(email => { if (email) setFields(f => (f.email ? f : { ...f, email })) })
    try {
      const ref = document.referrer
      if (ref && new URL(ref).origin === window.location.origin) setFields(f => (f.pageUrl ? f : { ...f, pageUrl: ref }))
    } catch { /* нет referrer — поле остаётся пустым */ }
  }, [])

  const set = (k: keyof CareFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const bad = validateCareFields(fields)
    setInvalid(bad)
    if (bad.length) return
    setStatus('loading')
    setStatus(await submitCare(fetch, fields, { site, locale }))
  }

  if (status === 'ok') {
    return (
      <div role="status" style={{
        padding: '2rem', border: '1px solid var(--text-accent)', borderRadius: 'var(--radius)',
        color: 'var(--text-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: 1.6,
      }}>
        {t.success}
      </div>
    )
  }

  const err = (k: keyof CareFields) => invalid.includes(k)

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={fieldStyle}>
        <label htmlFor="care-topic" style={labelStyle}>{t.topicLabel}</label>
        <select id="care-topic" name="topic" value={fields.topic} onChange={set('topic')} required
          aria-invalid={err('topic')} aria-describedby={invalid.length ? 'care-error' : undefined} style={inputStyle}>
          <option value="">{t.topicPlaceholder}</option>
          {topics.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="care-message" style={labelStyle}>{t.messageLabel}</label>
        <textarea id="care-message" name="message" value={fields.message} onChange={set('message')} required rows={6}
          maxLength={CARE.limits.messageMax} aria-invalid={err('message')} aria-describedby="care-message-hint"
          style={{ ...inputStyle, resize: 'vertical' }} />
        <p id="care-message-hint" style={hintStyle}>{t.messageHint}</p>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="care-email" style={labelStyle}>{t.emailLabel}</label>
        <input id="care-email" name="email" type="email" autoComplete="email" value={fields.email} onChange={set('email')} required
          aria-invalid={err('email')} aria-describedby="care-email-hint" style={inputStyle} />
        <p id="care-email-hint" style={hintStyle}>{t.emailHint}</p>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="care-page" style={labelStyle}>{t.pageUrlLabel}</label>
        <input id="care-page" name="pageUrl" type="url" inputMode="url" value={fields.pageUrl} onChange={set('pageUrl')}
          maxLength={CARE.limits.pageUrlMax} aria-describedby="care-page-hint" style={inputStyle} />
        <p id="care-page-hint" style={hintStyle}>{t.pageUrlHint}</p>
      </div>

      {/* Honeypot — скрыт от людей; бот заполняет, сервер молча отбрасывает (как у /api/leads/capture). */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
        value={fields.company} onChange={set('company')}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />

      {invalid.length > 0 && <p id="care-error" role="alert" style={{ color: 'var(--crit)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{t.requiredError}</p>}
      {status === 'error' && <p role="alert" style={{ color: 'var(--crit)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{t.error}</p>}
      {status === 'rate-limited' && <p role="alert" style={{ color: 'var(--crit)', fontSize: '0.875rem', margin: '0 0 1rem' }}>{t.rateLimited}</p>}

      <button type="submit" disabled={status === 'loading'} style={{
        padding: '0.875rem 2rem', background: 'var(--text-accent)', color: 'var(--text-on-accent)', fontWeight: 900,
        fontFamily: 'var(--font-mono)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em',
        borderRadius: 'var(--radius)', border: 'none', cursor: status === 'loading' ? 'wait' : 'pointer', alignSelf: 'flex-start',
      }}>
        {status === 'loading' ? t.submitting : t.submit}
      </button>
    </form>
  )
}
