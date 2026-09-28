'use client'
import { useEffect, useState } from 'react'
import { MANIFEST } from '@/lib/manifest'
import { loadInterestExample } from '@/lib/interest-example/client'
import { exampleParagraphs } from '@/lib/interest-example/render'
import { INTEREST_LABELS, type Interest } from '@/lib/interest-example/interests'
import type { InterestExampleItem, InterestLocale } from '@/lib/interest-example/types'

const T = {
  ru: { general: 'Пример', personal: 'Пример под твою сферу', showGeneral: 'Показать общий пример', showPersonal: 'Показать под мою сферу' },
  en: { general: 'Example', personal: 'Example for your field', showGeneral: 'Show the general example', showPersonal: 'Show for my field' },
}

const codeStyle = {
  fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
  borderRadius: '3px', padding: '0.1em 0.4em', fontSize: '0.875em', color: 'var(--text-accent)',
} as const

/** Пример концепт-фазы (intake LMS#8). Общий текст виден сразу (SSR); персональный заменяет его,
 *  только если воркер вернул пример, прошедший гвард. Любой отказ — общий пример без следа ошибки. */
export function InterestExample({ item, locale, initial }: {
  item: InterestExampleItem
  locale: InterestLocale
  /** Только для тестов рендера: готовый персональный пример без сети. */
  initial?: { interest: Interest; text: string } | null
}) {
  const t = T[locale]
  const source = item.text[locale]
  const [personal, setPersonal] = useState<{ interest: Interest; text: string } | null>(initial ?? null)
  const [showGeneral, setShowGeneral] = useState(false)

  useEffect(() => {
    if (initial !== undefined) return
    let alive = true
    loadInterestExample({ module: item.module, unit: item.unit, id: item.id, locale }, source, MANIFEST)
      .then(r => { if (alive && r) setPersonal(r) })
    return () => { alive = false }
  }, [item.module, item.unit, item.id, locale, source, initial])

  const usePersonal = personal !== null && !showGeneral
  const text = usePersonal ? personal.text : source

  return (
    <aside style={{ margin: '1.5rem 0', padding: '1rem 1.25rem', borderLeft: '3px solid var(--text-accent)', background: 'var(--bg-surface)', borderRadius: '0 var(--radius) var(--radius) 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          {usePersonal ? `${t.personal}: ${INTEREST_LABELS[personal.interest][locale]}` : t.general}
        </span>
        {personal && (
          <button type="button" onClick={() => setShowGeneral(v => !v)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>
            {showGeneral ? t.showPersonal : t.showGeneral}
          </button>
        )}
      </div>
      <div aria-live="polite">
        {exampleParagraphs(text).map((segs, i) => (
          <p key={i} style={{ lineHeight: 1.75, margin: i === 0 ? 0 : '0.75rem 0 0', color: 'var(--text-primary)' }}>
            {segs.map((s, j) => s.code ? <code key={j} style={codeStyle}>{s.text}</code> : <span key={j}>{s.text}</span>)}
          </p>
        ))}
      </div>
    </aside>
  )
}
