'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { NavigationItem } from '@/lib/content'
import { useProgress } from './progress-provider'
import { useUnitProgress } from '@/lib/unit-progress'
import { getDictionary, type Locale } from '@/lib/dictionaries'

interface SidebarProps {
  navItems: NavigationItem[]
  currentSlug?: string
  currentUnit?: string
  locale?: Locale
}

function LessonIcon({ state }: { state: 'completed' | 'viewed' | 'none' }) {
  if (state === 'completed') return <span style={{ color: 'var(--text-accent)' }}>●</span>
  if (state === 'viewed') return <span style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>◐</span>
  return <span style={{ color: 'var(--border-color)' }}>○</span>
}

function UnitIcon({ state }: { state: 'completed' | 'current' | 'none' }) {
  if (state === 'completed') return <span style={{ color: 'var(--text-accent)', fontSize: 'var(--text-xs)' }}>✓</span>
  if (state === 'current') return <span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>→</span>
  return <span style={{ color: 'var(--border-color)', fontSize: 'var(--text-xs)' }}>○</span>
}

export function Sidebar({ navItems, currentSlug, currentUnit, locale = 'ru' }: SidebarProps) {
  const { getState } = useProgress()
  const { isCompleted: isUnitCompleted, ready } = useUnitProgress()
  const [, forceRender] = useState(0)
  const t = getDictionary(locale)
  const prefix = locale === 'en' ? '/en' : ''

  useEffect(() => {
    if (ready) forceRender(n => n + 1)
  }, [ready])

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      borderRight: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '1.5rem 0',
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {t.sidebar.label}
        </span>
      </div>

      {navItems.map(item => {
        const isActiveModule = item.slug === currentSlug
        const isActiveLesson = item.type === 'lesson' && item.slug === currentSlug

        if (item.type === 'lesson') {
          const state = getState(item.slug)
          return (
            <Link key={item.slug} href={`${prefix}/lessons/${item.slug}/`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: isActiveLesson ? 'var(--text-accent)' : 'var(--text-secondary)',
              background: isActiveLesson ? 'var(--border-accent)' : 'transparent',
              borderLeft: isActiveLesson ? '2px solid var(--text-accent)' : '2px solid transparent',
            }}>
              <LessonIcon state={state} />
              <span style={{ flex: 1 }}>{item.title}</span>
            </Link>
          )
        }

        // type === 'module'
        return (
          <div key={item.slug}>
            <Link href={`${prefix}/lessons/${item.slug}/`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: isActiveModule ? 'var(--text-accent)' : 'var(--text-secondary)',
              background: isActiveModule ? 'var(--border-accent)' : 'transparent',
              borderLeft: isActiveModule ? '2px solid var(--text-accent)' : '2px solid transparent',
            }}>
              <span style={{ color: 'var(--border-color)', fontSize: '0.8rem' }}>⬡</span>
              <span style={{ flex: 1 }}>{item.title}</span>
            </Link>

            {/* Unit sub-items — visible when this module is active */}
            {isActiveModule && item.units && (
              <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)', marginLeft: '1rem' }}>
                {item.units.map(unit => {
                  const isCurrent = unit.slug === currentUnit
                  const completed = ready && isUnitCompleted(item.slug, unit.slug)
                  const unitState = completed ? 'completed' : isCurrent ? 'current' : 'none'

                  return (
                    <Link key={unit.slug} href={`${prefix}/lessons/${item.slug}/${unit.slug}/`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isCurrent ? 'var(--bg-surface)' : 'transparent',
                      borderRadius: '4px',
                      margin: '1px 4px',
                    }}>
                      <UnitIcon state={unitState} />
                      <span style={{ flex: 1, fontSize: 'var(--text-xs)' }}>{unit.title}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}
