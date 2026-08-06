// web/components/dungeon/dungeon-view.tsx
'use client'

import type { Locale } from '@/lib/intake/types'
import type { DungeonView } from '@/lib/dungeon/types'
import { HelpTip } from '@/components/help/help-tip'
import { IntroCard } from '@/components/help/intro-card'

const TIER_LABEL: Record<string, Record<Locale, string>> = {
  task: { ru: 'задача', en: 'task' },
  process: { ru: 'процесс', en: 'process' },
  outcome: { ru: 'результат', en: 'outcome' },
}
const MARK_DONE: Record<Locale, string> = { ru: 'Готово', en: 'Mark done' }
const DONE: Record<Locale, string> = { ru: 'пройдено', en: 'cleared' }
const BOSS: Record<Locale, string> = { ru: 'БОСС', en: 'BOSS' }
const CLEARED_BANNER: Record<Locale, string> = { ru: 'Подземелье пройдено 🏆', en: 'Dungeon cleared 🏆' }
const lockedLine = (locale: Locale, moduleTitle: string, name: string) =>
  locale === 'en' ? `Complete "${moduleTitle}" to enter ${name}.` : `Пройди «${moduleTitle}», чтобы войти в ${name}.`

interface Props {
  view: DungeonView
  locale: Locale
  accent: string
  moduleTitle: string
  isCleared: (id: string) => boolean
  onClear: (id: string, cs: number) => void
}

export function DungeonView({ view, locale, accent, moduleTitle, isCleared, onClear }: Props) {
  if (view.locked) {
    return (
      <section style={{ border: `1px solid var(--border-color)`, borderRadius: 12, padding: '1.5rem', textAlign: 'center', background: 'var(--bg-surface)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <span aria-hidden="true">🔒</span> {view.dungeonName}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{lockedLine(locale, moduleTitle, view.dungeonName)}</p>
      </section>
    )
  }

  const bossDone = isCleared(view.boss.id)

  return (
    <section>
      <IntroCard page="dungeon" locale={locale} accent={accent} />
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: accent, marginBottom: '0.4rem' }}>
        <span aria-hidden="true">🗝</span> {view.dungeonName} <HelpTip id="dungeon-stages" locale={locale} />
      </h1>
      <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{view.intro}</p>

      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {view.stages.map((s, i) => {
          const done = isCleared(s.id)
          return (
            <div key={s.id} style={{ border: `1px solid ${done ? accent : 'var(--border-color)'}`, borderRadius: 10, padding: '0.9rem 1.1rem', opacity: done ? 0.7 : 1, background: 'var(--bg-surface)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                {locale === 'en' ? `Stage ${i + 1}` : `Этап ${i + 1}`} · {TIER_LABEL[s.tier][locale]} · +{s.cs} <span aria-hidden="true">💎</span>
              </div>
              <div style={{ fontSize: '0.95rem', margin: '0.35rem 0 0.6rem' }}>{s.body}</div>
              {done
                ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: accent }}>✓ {DONE[locale]}</span>
                : <button type="button" onClick={() => onClear(s.id, s.cs)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: '0.4rem 0.8rem', borderRadius: 6, border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer' }}>{MARK_DONE[locale]}</button>}
            </div>
          )
        })}

        <div style={{ border: `2px solid ${bossDone ? accent : 'var(--text-accent)'}`, borderRadius: 10, padding: '1rem 1.1rem', background: 'var(--bg-surface)', opacity: bossDone ? 0.75 : 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.06em', color: accent }}>
            <span aria-hidden="true">☠</span> {BOSS[locale]}: {view.boss.name} · +{view.boss.cs} <span aria-hidden="true">💎</span>
          </div>
          <div style={{ fontSize: '0.98rem', margin: '0.4rem 0 0.7rem' }}>{view.boss.body}</div>
          {bossDone
            ? <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: accent }}>{CLEARED_BANNER[locale]}</div>
            : <button type="button" onClick={() => onClear(view.boss.id, view.boss.cs)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', background: accent, color: '#000', fontWeight: 700, cursor: 'pointer' }}>{MARK_DONE[locale]}</button>}
        </div>
      </div>
    </section>
  )
}
