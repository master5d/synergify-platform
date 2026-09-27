'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from '@/components/theme-provider'
import { RpgModeToggle } from '@/components/rpg-mode-toggle'
import { effectiveRpgMode, type RpgMode } from '@/lib/rpg-mode'
import { LiteToggle, LITE_LABEL } from '@/components/lite-toggle'
import { useLite } from '@/components/lite-provider'
import { getDictionary } from '@/lib/dictionaries'
import type { Locale } from '@/lib/intake/types'

interface Props {
  locale: Locale
  /** ОС определяется на клиенте; пока не определена — секции просто нет. */
  os: 'mac' | 'windows' | null
  onToggleOs: () => void
  osTitle: string
  osLabel: string
}

const LABELS: Record<'ru' | 'en', {
  button: string
  heading: string
  theme: string
  presentation: string
  traffic: string
  system: string
  close: string
}> = {
  ru: {
    button: 'Настройки',
    heading: 'Настройки отображения',
    theme: 'Тема',
    presentation: 'Режим подачи',
    traffic: 'Экономия трафика',
    system: 'Твоя система',
    close: 'Закрыть',
  },
  en: {
    button: 'Settings',
    heading: 'Display settings',
    theme: 'Theme',
    presentation: 'Presentation',
    traffic: 'Data saving',
    system: 'Your system',
    close: 'Close',
  },
}

/**
 * Переключатели отображения, свёрнутые в одну кнопку.
 *
 * Раньше они лежали в шапке в развёрнутом виде и занимали ~460px — больше, чем
 * вся навигация по курсу; на широком экране из-за них шапка распирала страницу,
 * а пункты меню уезжали в прокрутку. Это настройки, а не навигация: их трогают
 * один раз, а место они занимали постоянно.
 *
 * Ничего не выброшено — тема, режим подачи, экономия трафика и выбор системы
 * живут внутри панели теми же компонентами, что и раньше.
 */
export function SettingsMenu({ locale, os, onToggleOs, osTitle, osLabel }: Props) {
  const l: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  const t = LABELS[l]
  const nav = getDictionary(locale).nav
  const [open, setOpen] = useState(false)
  // Иконки (☀/☾/🖥, 🎲/📄, 🍎/⊞) сами по себе не говорят, какое значение выбрано
  // прямо сейчас — подписи для этого уже есть в дереве доступности (aria-label/title
  // тех же переключателей), здесь они просто становятся видимыми рядом с иконками.
  const { pref: themePref } = useTheme()
  const { pref: litePref } = useLite()
  const [rpgMode, setRpgMode] = useState<RpgMode>('rpg')
  useEffect(() => { setRpgMode(effectiveRpgMode()) }, [])
  // Низ шапки в момент открытия. Нужен только узкому экрану, где панель
  // прижимается к краям окна: шапка там переносится в несколько рядов, и её
  // высота заранее неизвестна (44px без переносов, 123px с ними).
  const [panelTop, setPanelTop] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  // Закрытие: клик мимо и Escape. Без этого панель остаётся висеть поверх
  // страницы и перехватывает клики по контенту под собой.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()      // фокус возвращается на кнопку, а не улетает в начало
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '1rem', padding: '0.55rem 0',
  }
  const captionStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
    color: 'var(--text-secondary)', whiteSpace: 'nowrap',
  }
  const valueStyle: React.CSSProperties = { ...captionStyle, color: 'var(--text-primary)' }
  const osShort = os === 'mac' ? 'macOS' : 'Windows'

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'flex' }}>
      <style>{`
        /* На узком экране панель шире, чем расстояние от кнопки до левого края,
           и при привязке к кнопке уезжала за границу окна (замер: left = -24px).
           Прижимаем её к краям самого окна — тогда видно целиком на любой ширине. */
        @media (max-width: 720px) {
          .settings-panel {
            position: fixed !important;
            left: 0.75rem !important;
            right: 0.75rem !important;
            top: var(--settings-panel-top) !important;
            min-width: 0 !important;
          }
        }
      `}</style>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const navEl = wrapRef.current?.closest('nav')
          if (navEl) setPanelTop(Math.round(navEl.getBoundingClientRect().bottom + 8))
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={t.button}
        title={t.button}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
          minWidth: '24px', minHeight: '24px',
          background: open ? 'var(--bg-surface)' : 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: 20, cursor: 'pointer', padding: '3px 10px',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)', lineHeight: 1.6,
        }}
      >
        <span aria-hidden="true">⚙</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t.heading}
          className="settings-panel"
          style={{
            ['--settings-panel-top' as string]: `${panelTop}px`,
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 20,
            minWidth: 'min(19rem, calc(100vw - 2rem))',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '0.8rem 1rem 1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          }}
        >
          <p style={{ ...captionStyle, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
            {t.heading}
          </p>

          <div style={{ ...rowStyle, borderTop: '1px solid var(--border-color)' }}>
            <span style={captionStyle}>{t.theme}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={valueStyle}>{nav.theme[themePref]}</span>
              <ThemeToggle locale={locale} />
            </div>
          </div>

          <div style={{ ...rowStyle, borderTop: '1px solid var(--border-color)' }}>
            <span style={captionStyle}>{t.presentation}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={valueStyle}>{nav.rpgMode[rpgMode]}</span>
              <RpgModeToggle locale={locale} />
            </div>
          </div>

          <div style={{ ...rowStyle, borderTop: '1px solid var(--border-color)' }}>
            <span style={captionStyle}>{t.traffic}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={valueStyle}>{(LITE_LABEL[l] ?? LITE_LABEL.ru)[litePref]}</span>
              <LiteToggle locale={locale} />
            </div>
          </div>

          {os && (
            <div style={{ ...rowStyle, borderTop: '1px solid var(--border-color)' }}>
              <span style={captionStyle}>{t.system}</span>
              <button
                type="button"
                onClick={onToggleOs}
                title={osTitle}
                aria-label={osLabel}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                }}
              >
                <span style={valueStyle}>{osShort}</span>
                <span style={{
                  display: 'flex', background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)', borderRadius: 20,
                  overflow: 'hidden',
                }}>
                <span style={{
                  padding: '3px 8px',
                  background: os === 'mac' ? 'var(--text-accent)' : 'transparent',
                  color: os === 'mac' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  fontWeight: os === 'mac' ? 700 : 400,
                }}>🍎</span>
                <span style={{
                  padding: '3px 8px',
                  background: os === 'windows' ? 'var(--text-accent)' : 'transparent',
                  color: os === 'windows' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                  fontWeight: os === 'windows' ? 700 : 400,
                }}>🪟</span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
