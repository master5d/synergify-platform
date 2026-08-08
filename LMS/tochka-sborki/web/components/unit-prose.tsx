'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { useUnitProgress } from '@/lib/unit-progress'

// Prose-разметка юнита (Ф4 S1): вторая оболочка над тем же MDX.
// Курс без фаз получает сплошной текст без ложной шкалы из четырёх шагов —
// но сохраняет хлебную крошку, отметку «пройдено» и переход к следующему уроку,
// то есть прогресс-контур платформы у обоих форматов ОДИН.
interface Props {
  moduleSlug: string
  unitSlug: string
  nextUnitSlug: string | null
  moduleTitle: string
  unitIndex: number
  totalUnits: number
  locale?: Locale
  children: React.ReactNode
}

export function UnitProse({
  moduleSlug,
  unitSlug,
  nextUnitSlug,
  moduleTitle,
  unitIndex,
  totalUnits,
  locale = 'ru',
  children,
}: Props) {
  const t = getDictionary(locale).wizard
  const prefix = locale === 'en' ? '/en' : ''
  const router = useRouter()
  const { markCompleted } = useUnitProgress()
  const [done, setDone] = useState(false)

  function handleComplete() {
    markCompleted(moduleSlug, unitSlug)
    setDone(true)
  }

  function handleNextUnit() {
    router.push(nextUnitSlug
      ? `${prefix}/lessons/${moduleSlug}/${nextUnitSlug}/`
      : `${prefix}/lessons/${moduleSlug}/`)
  }

  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
      }}>
        {moduleTitle} · {t.unit(unitIndex + 1, totalUnits)}
      </div>

      <div style={{ minHeight: '40vh' }}>{children}</div>

      <div style={{
        marginTop: '2.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          opacity: done ? 1 : 0,
        }}>
          {t.done}
        </span>
        {done ? (
          <button
            onClick={handleNextUnit}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--text-accent)',
              border: 'none',
              color: 'var(--text-on-accent)',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {nextUnitSlug ? t.nextUnit : t.moduleComplete}
          </button>
        ) : (
          <button
            onClick={handleComplete}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--text-accent)',
              border: 'none',
              color: 'var(--text-on-accent)',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {t.complete}
          </button>
        )}
      </div>
    </div>
  )
}
