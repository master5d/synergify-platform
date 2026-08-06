// web/components/dungeon/dungeon-card.tsx
'use client'

import Link from 'next/link'
import type { Locale, WorldSkin } from '@/lib/intake/types'
import { useDungeon } from '@/lib/dungeon/use-dungeon'
import { HelpTip } from '@/components/help/help-tip'

const ENTER: Record<Locale, string> = { ru: 'Войти', en: 'Enter' }
const CLEARED: Record<Locale, string> = { ru: '✓ Пройдено', en: '✓ Cleared' }
const lockedLine = (locale: Locale, moduleTitle: string) =>
  locale === 'en' ? `Complete "${moduleTitle}" to unlock` : `Пройди «${moduleTitle}», чтобы открыть`

interface Props {
  locale: Locale
  accent: string
  skin: WorldSkin
  niche: string | null
  outcome: string | null
  moduleTitle: string
  isModuleCompleted: (moduleSlug: string) => boolean
  helpId?: string
}

export function DungeonCard({ locale, accent, skin, niche, outcome, moduleTitle, isModuleCompleted, helpId }: Props) {
  const { view, bossCleared, ready } = useDungeon({ locale, skin, niche, outcome, isModuleCompleted })
  if (!ready) return null

  const prefix = locale === 'en' ? '/en' : ''
  const cleared = bossCleared

  return (
    <section style={{ border: `1px solid ${view.locked ? 'var(--border-color)' : accent}`, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: view.locked ? 'var(--text-secondary)' : accent }}>
          <span aria-hidden="true">{view.locked ? '🔒' : '🗝'}</span> {view.dungeonName} {helpId && <HelpTip id={helpId} locale={locale} />}
        </div>
        {view.locked && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{lockedLine(locale, moduleTitle)}</div>}
      </div>
      {view.locked
        ? null
        : cleared
          ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: accent }}>{CLEARED[locale]}</span>
          : <Link href={`${prefix}/dungeon/`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.45rem 0.9rem', borderRadius: 6, background: accent, color: '#000', fontWeight: 700, textDecoration: 'none' }}>{ENTER[locale]} →</Link>}
    </section>
  )
}
