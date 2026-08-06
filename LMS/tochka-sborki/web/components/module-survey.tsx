'use client'

import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { LikertScale } from './likert-scale'

export function ModuleSurvey({ module, locale = 'ru' }: { module: string; locale?: Locale }) {
  const t = getDictionary(locale).feedback
  const key = 'module-survey:' + module
  const [mounted, setMounted] = useState(false)
  const [done, setDone] = useState(false)
  const [recommend, setRecommend] = useState('')
  const [impact, setImpact] = useState('')
  const [apply, setApply] = useState('')
  const [other, setOther] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  useEffect(() => {
    setMounted(true)
    try { if (localStorage.getItem(key)) setDone(true) } catch { /* ignore */ }
  }, [key])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson: module, recommend, impact, apply, other, locale }),
      })
      if (res.ok) {
        try { localStorage.setItem(key, '1') } catch { /* ignore */ }
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const box: React.CSSProperties = {
    margin: '2.5rem 0 1rem', padding: '1.5rem',
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)',
  }

  if (mounted && (done || status === 'success')) {
    return (
      <div style={{ ...box, color: 'var(--text-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
        {t.successMessage}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={box}>
      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{t.surveyHeading}</div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.5rem' }}>{t.surveySkipHint}</p>

      <LikertScale name="ms-recommend" label={t.recommendLabel} value={recommend} onChange={setRecommend} disagree={t.likertDisagree} agree={t.likertAgree} required={false} />
      <LikertScale name="ms-impact" label={t.impactLabel} value={impact} onChange={setImpact} disagree={t.likertDisagree} agree={t.likertAgree} required={false} />
      <LikertScale name="ms-apply" label={t.applyLabel} value={apply} onChange={setApply} disagree={t.likertDisagree} agree={t.likertAgree} required={false} />

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>{t.otherLabel}</label>
        <textarea
          value={other}
          onChange={e => setOther(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>

      {status === 'error' && (
        <p style={{ color: 'var(--crit)', marginBottom: '1rem', fontSize: '0.875rem' }}>{t.errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{ padding: '0.75rem 1.75rem', background: 'var(--text-accent)', color: 'var(--text-on-accent)', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 'var(--radius)', border: 'none', cursor: status === 'loading' ? 'wait' : 'pointer' }}
      >
        {status === 'loading' ? t.submitting : t.submit}
      </button>
    </form>
  )
}
