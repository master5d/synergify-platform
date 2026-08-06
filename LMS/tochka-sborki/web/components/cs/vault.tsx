// web/components/cs/vault.tsx
'use client'

import type { Locale, WorldSkin } from '@/lib/intake/types'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { SKIN_UNLOCK_COST } from '@/lib/cs/types'
import { useShards } from '@/lib/cs/use-shards'
import { useRpgMode } from '@/lib/use-rpg-mode'
import { HelpTip } from '@/components/help/help-tip'

const TITLE: Record<Locale, string> = { ru: 'Хранилище', en: 'Vault' }
// Subtitle is built with the currency word so plain mode can swap "шарды"/"shards" → "очки"/"points".
const SUBTITLE: Record<Locale, (currency: string) => string> = {
  ru: c => `Открывай альтернативные миры за ${c}.`,
  en: c => `Unlock alternate worlds with ${c}.`,
}
const OWNED: Record<Locale, string> = { ru: 'активный мир', en: 'active world' }
const UNLOCKED: Record<Locale, string> = { ru: 'открыто', en: 'unlocked' }
const UNLOCK: Record<Locale, string> = { ru: 'Открыть', en: 'Unlock' }

const SELECTABLE: WorldSkin[] = [
  'slavic-myth', 'dark-fantasy', 'cyber-noir', 'space-opera',
  'anime-quest', 'soviet-heroic', 'mystic-arcane',
]

export function Vault({ activeSkin, locale, helpId }: { activeSkin: WorldSkin; locale: Locale; helpId?: string }) {
  const { balance, spend, unlocked, ready } = useShards()
  const { plain } = useRpgMode(locale)
  if (!ready) return null
  const currency = plain('currency', locale === 'en' ? 'shards' : 'шарды')

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginBottom: '0.25rem' }}>{TITLE[locale]} {helpId && <HelpTip id={helpId} locale={locale} />}</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>{SUBTITLE[locale](currency)}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
        {SELECTABLE.map(skin => {
          const meta = SKINS_META[skin]
          const isActive = skin === activeSkin
          const isUnlocked = isActive || unlocked(skin)
          const canAfford = balance >= SKIN_UNLOCK_COST
          return (
            <div
              key={skin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.7rem 1rem',
                border: `1px solid ${isUnlocked ? meta.accent : 'var(--border-color)'}`,
                borderRadius: 8,
                opacity: isUnlocked ? 1 : 0.85,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{meta.glyph}</span>
                <span style={{ fontSize: '0.9rem' }}>{meta.displayName[locale]}</span>
              </span>
              {isActive ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: meta.accent }}>{OWNED[locale]}</span>
              ) : isUnlocked ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: meta.accent }}>{UNLOCKED[locale]}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => spend(SKIN_UNLOCK_COST, skin)}
                  disabled={!canAfford}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    padding: '0.4rem 0.7rem',
                    borderRadius: 6,
                    border: 'none',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    background: canAfford ? meta.accent : 'var(--border-color)',
                    color: canAfford ? '#000' : 'var(--text-secondary)',
                  }}
                >
                  {UNLOCK[locale]} · {SKIN_UNLOCK_COST} <span aria-hidden="true">💎</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
