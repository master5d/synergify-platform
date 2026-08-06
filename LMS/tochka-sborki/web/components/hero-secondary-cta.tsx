'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'

interface Props { locale: Locale }

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  textDecoration: 'none',
}

export function HeroSecondaryCta({ locale }: Props) {
  const t = getDictionary(locale)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.email) setAuthed(true) })
      .catch(() => {})
  }, [])

  const base = locale === 'en' ? '/en' : ''
  const href = authed ? `${base}/dashboard/` : `${base}/login/`
  const label = authed ? t.hero.ctaSecondaryAuthed : t.hero.ctaSecondary

  return <Link href={href} style={linkStyle}>{label}</Link>
}
