'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import type { NavLink } from '@/lib/nav-links'

interface Props {
  links: NavLink[]
  isActive: (href: string) => boolean
  /** Доступное имя кнопки и заголовок панели — одна и та же строка (как у ⚙, см. settings-menu.tsx). */
  label: string
}

/**
 * Бургер для вторичной навигации на ≤720px (BACKLOG «Мобильная навигация без меню»):
 * `.nav-secondary-links` там скрыт целиком без замены — Программа/Дорожная карта/Шпаргалка и
 * остальное были недостижимы с телефона без входа. Список пунктов приходит готовым
 * (см. lib/nav-links.ts) — те же ссылки, что и в десктопной полосе, ничего сверх того,
 * что уже включено флагами пака на десктопе.
 *
 * Открытие/закрытие — тот же приём, что уже проверен в SettingsMenu: клик мимо и
 * Escape закрывают, фокус на Escape возвращается на кнопку.
 */
export function NavMobileMenu({ links, isActive, label }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
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

  if (links.length === 0) return null

  return (
    <div ref={wrapRef} className="nav-mobile-menu" style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={label}
        title={label}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: '24px', minHeight: '24px',
          background: open ? 'var(--bg-surface)' : 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: 6, cursor: 'pointer', padding: '4px 7px',
          color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1,
        }}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 20,
            minWidth: 'min(14rem, calc(100vw - 2rem))',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '0.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column', gap: '0.15rem',
          }}
        >
          {links.map((l) => {
            const active = isActive(l.href)
            return (
              <Link
                key={l.key}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.55rem 0.6rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'var(--bg-surface)' : 'transparent',
                }}
              >
                {l.label}
                {l.deco ? <> <span aria-hidden="true">{l.deco}</span></> : null}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
