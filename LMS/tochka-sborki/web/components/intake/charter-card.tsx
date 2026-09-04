'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { profileToCharter } from '@/lib/intake/charter'
import { buildSelfProfilePrompt } from '@/lib/intake/self-profile-prompt'
import { SheetSection, SHEET_PRE, SHEET_BTN } from './sheet-section'

export function CharterCard({ profile, locale }: { profile: any; locale: Locale }) {
  const [copied, setCopied] = useState(false)
  const [profileCopied, setProfileCopied] = useState(false)
  const charter = profileToCharter(profile, locale)
  const t = locale === 'en'
    ? { title: 'Companion charter', copy: 'Copy charter', copied: 'Copied ✓', profile: 'Build my learning profile with AI', profileCopied: 'Copied ✓' }
    : { title: 'Устав напарника', copy: 'Скопировать устав', copied: 'Скопировано ✓', profile: 'Собрать мой профиль обучения с ИИ', profileCopied: 'Скопировано ✓' }
  const btn = SHEET_BTN

  return (
    <SheetSection title={t.title} glyph="📜">
      <pre style={SHEET_PRE}>{charter}</pre>
      <div style={{ display: 'flex', gap: 12, marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(charter); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {} }}>{copied ? t.copied : t.copy}</button>
        <button style={btn} onClick={async () => { try { await navigator.clipboard.writeText(buildSelfProfilePrompt(charter, locale)); setProfileCopied(true); setTimeout(() => setProfileCopied(false), 2000) } catch {} }}>{profileCopied ? t.profileCopied : t.profile}</button>
      </div>
    </SheetSection>
  )
}
