'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../lib/registry'
import { checkAdmission, gateCopy, type GateState } from '../lib/course/gate'

interface Props { locale: Locale; children: React.ReactNode }

const GOLD = 'var(--accent)'

/** Дверь урока: server-verified admission, fail-closed. Индекс курса открыт — гейт только тут. */
export function AdmissionGate({ locale, children }: Props) {
  const [state, setState] = useState<GateState>('checking')

  useEffect(() => {
    let alive = true
    checkAdmission().then((s) => { if (alive) setState(s) })
    return () => { alive = false }
  }, [])

  if (state === 'admitted') return <>{children}</>

  const t = gateCopy(locale)
  const back = locale === 'en' ? '/en/praktika/' : '/praktika/'

  if (state === 'checking') {
    return (
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', letterSpacing: '0.08em', padding: '2rem 0' }}>
        {t.checking}
      </p>
    )
  }

  return (
    <section aria-label={t.heading}>
      <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
        {t.eyebrow}
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '0.03em', margin: '1rem 0 1.5rem', color: 'var(--text-primary)' }}>
        {t.heading}
      </h2>
      {t.body.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', marginBottom: '1rem' }}>{p}</p>
      ))}
      <div style={{ border: '1px solid var(--accent)', borderRadius: 'var(--radius)', marginTop: '1.6rem', padding: '1rem', background: 'var(--accent-wash)' }}>
        <a href={t.ctaHref} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'lowercase', textDecoration: 'none' }}>
          {t.cta}
        </a>
      </div>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-sm)', marginTop: '1rem' }}>
        {t.returnHint}
      </p>
      <p style={{ marginTop: '2.5rem' }}>
        <a href={back} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
          {t.backLabel}
        </a>
      </p>
    </section>
  )
}
