'use client'

import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import {
  EMPTY_RETRO_FIELDS,
  buildRetroMarkdown,
  fetchIsGraduate,
  submitRetro,
  validateRetro,
  type RetroFieldKey,
  type RetroFields,
} from '@/lib/graduate-retro'

interface Props {
  locale: Locale
  /** Имя на сертификате — попадает в шапку скачиваемого .md, необязательно. */
  name?: string
}

const FIELD_KEYS: RetroFieldKey[] = ['before', 'after', 'prompt', 'plan', 'review']

/** Ретро выпускника (intake LMS#10): только вошедшему студенту, рядом с сертификатом.
 *  «План на месяц» и «до/после» студент может скачать себе — отзыв и лучший промпт
 *  уходят только нам, в course_feedback (lib/graduate-retro.ts:submitRetro). */
export function GraduateRetroForm({ locale, name }: Props) {
  const t = getDictionary(locale).retro
  const [authed, setAuthed] = useState(false)
  const [fields, setFields] = useState<RetroFields>(EMPTY_RETRO_FIELDS)
  const [errors, setErrors] = useState<Set<RetroFieldKey>>(new Set())
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetchIsGraduate(fetch).then(setAuthed)
  }, [])

  if (!authed) return null

  const labelFor: Record<RetroFieldKey, string> = {
    before: t.beforeLabel,
    after: t.afterLabel,
    prompt: t.promptLabel,
    plan: t.planLabel,
    review: t.reviewLabel,
  }

  function update(key: RetroFieldKey) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFields(f => ({ ...f, [key]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing = validateRetro(fields)
    if (missing.length > 0) {
      setErrors(new Set(missing))
      return
    }
    setErrors(new Set())
    setStatus('loading')
    const result = await submitRetro(fetch, fields, locale)
    setStatus(result.ok ? 'success' : 'error')
  }

  function downloadMarkdown() {
    const md = buildRetroMarkdown(fields, { name: name ?? '', date: new Date().toISOString().slice(0, 10) }, t)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'graduate-retro.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (status === 'success') {
    return (
      <section aria-label={t.heading} style={{ marginTop: '3rem', maxWidth: '640px' }}>
        <div style={{
          padding: '2rem',
          border: '1px solid var(--text-accent)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-accent)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
        }}>
          {t.successMessage}
        </div>
      </section>
    )
  }

  return (
    <section aria-label={t.heading} style={{ marginTop: '3rem', maxWidth: '640px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display), system-ui, sans-serif',
        fontSize: 'var(--text-xl)',
        color: 'var(--text-primary)',
        margin: '0 0 0.5rem',
      }}>
        {t.heading}
      </h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
        {t.subtitle}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        {FIELD_KEYS.map(key => {
          const fieldId = `retro-${key}`
          const errorId = `${fieldId}-error`
          const hasError = errors.has(key)
          return (
            <div key={key} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor={fieldId} style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {labelFor[key]}
              </label>
              <textarea
                id={fieldId}
                name={key}
                value={fields[key]}
                onChange={update(key)}
                rows={3}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : undefined}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${hasError ? 'var(--crit)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              {hasError && (
                <p id={errorId} role="alert" style={{ color: 'var(--crit)', marginTop: '0.4rem', marginBottom: 0, fontSize: '0.8rem' }}>
                  {t.requiredError}
                </p>
              )}
            </div>
          )
        })}

        {status === 'error' && (
          <p role="alert" style={{ color: 'var(--crit)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {t.errorMessage}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
            {status === 'loading' ? t.submitting : t.submit}
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {t.downloadAction}
          </button>
        </div>
      </form>
    </section>
  )
}
