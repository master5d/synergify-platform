'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { buildSelfProfilePrompt } from '@/lib/intake/self-profile-prompt'

export function CharterReveal({ charter, locale, onContinue }: { charter: string; locale: Locale; onContinue: () => void }) {
  const [copied, setCopied] = useState(false)
  const [profileCopied, setProfileCopied] = useState(false)
  const t = locale === 'en'
    ? { title: 'Your companion charter', body: 'This is the charter your co-thinking partner runs on. Copy it into any agent — or just continue.', copy: 'Copy charter', copied: 'Copied ✓', go: 'Meet your character →', profile: 'Build my learning profile with AI', profileCopied: 'Copied ✓' }
    : { title: 'Устав твоего напарника', body: 'Это устав, на котором работает твой со-мыслящий напарник. Скопируй его в любого агента — или просто продолжи.', copy: 'Скопировать устав', copied: 'Скопировано ✓', go: 'К твоему персонажу →', profile: 'Собрать мой профиль обучения с ИИ', profileCopied: 'Скопировано ✓' }
  // Self-contained styles: this view replaces the wizard (early return), so the
  // wizard's `.intake-nav-btn` <style> block is not mounted here.
  const btn: React.CSSProperties = {
    background: 'var(--bg-surface)', color: 'var(--text-primary)',
    border: '1px solid var(--border-color)', borderRadius: 8,
    padding: '12px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
  }
  const btnPrimary: React.CSSProperties = {
    ...btn, background: 'var(--text-accent)', color: 'var(--text-on-accent)',
    borderColor: 'var(--text-accent)', fontWeight: 700,
  }
  return (
    <main style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.6rem' }}>{t.title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: 1.5 }}>{t.body}</p>
      <pre style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem', overflowX: 'auto', fontSize: '.82rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{charter}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1.4rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(charter); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(buildSelfProfilePrompt(charter, locale)); setProfileCopied(true); setTimeout(() => setProfileCopied(false), 2000) } catch {} }}>{profileCopied ? t.profileCopied : t.profile}</button>
        <button style={btnPrimary} onClick={onContinue}>{t.go}</button>
      </div>
    </main>
  )
}
