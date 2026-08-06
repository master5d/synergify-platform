'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { profileToCharter } from '@/lib/intake/charter'
import { buildSelfProfilePrompt } from '@/lib/intake/self-profile-prompt'

export function CharterCard({ profile, locale }: { profile: any; locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const [profileCopied, setProfileCopied] = useState(false)
  const charter = profileToCharter(profile, locale)
  const t = locale === 'en'
    ? { title: 'Companion charter', copy: 'Copy charter', copied: 'Copied ✓', profile: 'Build my learning profile with AI', profileCopied: 'Copied ✓' }
    : { title: 'Устав напарника', copy: 'Скопировать устав', copied: 'Скопировано ✓', profile: 'Собрать мой профиль обучения с ИИ', profileCopied: 'Скопировано ✓' }
  const btn: React.CSSProperties = { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <section style={{ maxWidth: 640, margin: '2rem auto 3rem', padding: '0 1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '.6rem' }}>{t.title}</h2>
      <pre style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', overflowX: 'auto', fontSize: '.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{charter}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(charter); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(buildSelfProfilePrompt(charter, locale)); setProfileCopied(true); setTimeout(() => setProfileCopied(false), 2000) } catch {} }}>{profileCopied ? t.profileCopied : t.profile}</button>
      </div>
    </section>
  )
}
