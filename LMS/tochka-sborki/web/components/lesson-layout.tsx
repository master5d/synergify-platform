'use client'

import { useEffect, useState } from 'react'
import type { LessonMeta, NavigationItem } from '@/lib/content'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { Nav } from './nav'
import { Footer } from './footer'
import { Sidebar } from './sidebar'
import { AssignmentBlock } from './assignment-block'
import { useProgress } from './progress-provider'
import { AuthGuard } from './auth-guard'
import { IntakeGuard } from '@/components/intake-guard'
import { MobileGate } from './mobile-gate'

interface LessonLayoutProps {
  meta: LessonMeta
  navItems: NavigationItem[]
  children: React.ReactNode
  locale?: Locale
}

export function LessonLayout({ meta, navItems, children, locale = 'ru' }: LessonLayoutProps) {
  const t = getDictionary(locale).lesson
  const { getState, markViewed, markCompleted } = useProgress()
  const state = getState(meta.slug)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    markViewed(meta.slug)
  }, [meta.slug, markViewed])

  async function handleComplete() {
    setCompleting(true)
    await markCompleted(meta.slug)
    setCompleting(false)
  }

  return (
    <AuthGuard locale={locale}>
      <IntakeGuard locale={locale}>
      <MobileGate locale={locale}>
      <Nav locale={locale} />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 3rem)' }}>
        <Sidebar navItems={navItems} currentSlug={meta.slug} locale={locale} />
        <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '2rem 3rem', maxWidth: '860px' }}>
          <div style={{
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-accent)',
          }}>
            {meta.duration}
          </div>
          {children}
          {meta.assignment && <AssignmentBlock text={meta.assignment} />}

          {/* Complete button */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            {state === 'completed' ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--text-accent)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
              }}>
                {t.completed}
              </div>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  cursor: completing ? 'wait' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {completing ? t.completing : t.complete}
              </button>
            )}
          </div>
        </main>
      </div>
      <Footer locale={locale} topics={navItems.filter(i => i.type === 'module').map(i => ({ slug: i.slug, title: i.title }))} />
      </MobileGate>
      </IntakeGuard>
    </AuthGuard>
  )
}
