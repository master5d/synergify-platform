'use client'

import { useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import type { CaptureFormConfig } from '@/lib/content/capture-forms'

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

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600,
}

export function CaptureForm({ config, locale = 'ru' }: { config: CaptureFormConfig; locale?: Locale }) {
  const t = getDictionary(locale).capture
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, city, message, consent, company,
          event: config.event, locale,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        padding: '2rem',
        border: '1px solid var(--text-accent)',
        borderRadius: 'var(--radius)',
        color: 'var(--text-accent)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.875rem',
      }}>
        {config.successMessage}
      </div>
    )
  }

  return (
    <section style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      background: 'var(--bg-secondary)',
      padding: '1.5rem',
    }}>
      <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>{config.heading}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{config.blurb}</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>{t.nameLabel}</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>{t.emailLabel}</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>{t.phoneLabel}</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
            {config.phoneJustification}
          </p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>{t.cityLabel}</label>
          {config.cities.length > 0 ? (
            <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle}>
              <option value="">{t.cityPlaceholder}</option>
              {config.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input type="text" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
          )}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>{t.messageLabel}</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {/* Honeypot — hidden from real users; bots fill it and get silently dropped server-side. */}
        <input
          type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
          value={company} onChange={e => setCompany(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
        />

        <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)}
            style={{ marginTop: '0.2rem' }} />
          <span>{config.consentLabel}</span>
        </label>

        {status === 'error' && (
          <p style={{ color: 'var(--crit)', marginBottom: '1rem', fontSize: '0.875rem' }}>{t.errorMessage}</p>
        )}

        <button type="submit" disabled={status === 'loading' || !consent}
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
            cursor: status === 'loading' || !consent ? 'not-allowed' : 'pointer',
            opacity: !consent ? 0.5 : 1,
            alignSelf: 'flex-start',
          }}>
          {status === 'loading' ? t.submitting : config.cta}
        </button>
      </form>
    </section>
  )
}
