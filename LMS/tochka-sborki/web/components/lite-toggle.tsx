'use client'
import { useEffect, useState } from 'react'
import { useLite } from '@/components/lite-provider'
import type { Locale } from '@/lib/dictionaries'
import type { LitePref } from '@/lib/lite-pref'

const SEGMENTS: LitePref[] = ['on', 'auto', 'off']

const ARIA: Record<Locale, { group: string } & Record<LitePref, string>> = {
  ru: { group: 'Режим экономии трафика', on: 'Лёгкий режим', auto: 'Авто (по скорости сети)', off: 'Полный режим' },
  en: { group: 'Data-saver mode', on: 'Lite mode', auto: 'Auto (by connection)', off: 'Full mode' },
}

// Видимые подписи сегментов — раньше были захардкожены по-английски (Lite/Auto/Full)
// независимо от локали, хотя вся остальная панель настроек локализована. Экспортируется:
// SettingsMenu переиспользует те же подписи для видимого текста текущего значения.
export const LITE_LABEL: Record<Locale, Record<LitePref, string>> = {
  ru: { on: 'Лайт', auto: 'Авто', off: 'Полный' },
  en: { on: 'Lite', auto: 'Auto', off: 'Full' },
}

export function LiteToggle({ locale }: { locale: Locale }) {
  const { pref, setPref } = useLite()
  const a = ARIA[locale] ?? ARIA.ru
  const label = LITE_LABEL[locale] ?? LITE_LABEL.ru
  const [mounted, setMounted] = useState(false)

  // Render only after mount: pref is corrected from storage in an effect.
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      role="radiogroup"
      aria-label={a.group}
      style={{
        display: 'flex',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {SEGMENTS.map(key => {
        const active = pref === key
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={a[key]}
            title={a[key]}
            onClick={() => setPref(key)}
            style={{
              padding: '3px 8px',
              cursor: 'pointer',
              border: 'none',
              background: active ? 'var(--text-accent)' : 'transparent',
              color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              fontWeight: active ? 700 : 400,
            }}
          >
            {label[key]}
          </button>
        )
      })}
    </div>
  )
}
