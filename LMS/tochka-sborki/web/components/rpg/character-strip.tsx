'use client'
import Link from 'next/link'
import type { QuestLogVM } from '@/lib/rpg/types'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import type { Locale } from '@/lib/intake/types'

export function CharacterStrip({ summary, accent, locale }: { summary: QuestLogVM['summary']; accent: string; locale: Locale }) {
  const meta = SKINS_META[summary.skin]
  const lvl = locale === 'en' ? 'Level' : 'Уровень'
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
      flexWrap: 'wrap',
      padding: '1.1rem 1.3rem', border: '1px solid var(--border-color)', borderRadius: 12,
      background: `linear-gradient(135deg, ${accent}14, transparent)` }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.64rem', letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '.35rem' }}>
          {meta.glyph} {meta.displayName[locale]} · {summary.charClass} · {lvl} {summary.level}
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1 }}>{summary.legendaryTitle}</div>
        <Link href={locale === 'en' ? '/en/character/' : '/character/'} style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: accent }}>⬡ {locale === 'en' ? 'Character sheet →' : 'Лист персонажа →'}</Link>
      </div>
      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '.66rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        <b style={{ color: accent, fontSize: '1.3rem', display: 'block' }}>{summary.completedCount}/{summary.total}</b>
        {locale === 'en' ? 'quests done' : 'квестов'}
      </div>
    </div>
  )
}
