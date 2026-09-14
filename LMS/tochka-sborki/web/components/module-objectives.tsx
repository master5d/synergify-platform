import type { Objective } from '@/lib/content'

const T = { ru: { heading: 'Цели модуля', short: 'Цели' }, en: { heading: 'Module goals', short: 'Goals' } }

const list = (objectives: Objective[]) => (
  <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.6 }}>
    {objectives.map(o => <li key={o.id}>{o.text}</li>)}
  </ul>
)

/** Цели модуля в начале первого урока (intake LMS#9). Врезка — как цель урока в lesson-prose. */
export function ModuleObjectives({ objectives, locale }: { objectives?: Objective[]; locale: 'ru' | 'en' }) {
  if (!objectives?.length) return null
  return (
    <aside aria-label={T[locale].heading} style={{ margin: '0 0 1.75rem', fontSize: '.95rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-accent)', paddingLeft: '.9rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>{T[locale].heading}</div>
      {list(objectives)}
    </aside>
  )
}

/** Свёрнутые цели модуля в дереве курса. */
export function ObjectivesDisclosure({ objectives, locale }: { objectives?: Objective[]; locale: 'ru' | 'en' }) {
  if (!objectives?.length) return null
  return (
    <details style={{ margin: '0 0 0.9rem', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '70ch' }}>
      <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)' }}>{T[locale].short}</summary>
      <div style={{ marginTop: '0.4rem' }}>{list(objectives)}</div>
    </details>
  )
}
