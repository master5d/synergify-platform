// components/ai-doubles-band.tsx
// Framing band on the showcase: the five AI doubles the learner builds.
// Data-driven from getAiDoubles; sits above the example cases as the "what you'll build" lens.
import { getAiDoubles } from '@/lib/course/ai-doubles'
import type { Locale } from '@/lib/intake/types'

export function AiDoublesBand({ locale }: { locale: Locale }) {
  const { heading, lead, doubles } = getAiDoubles(locale)
  return (
    <div style={{ margin: '0 0 2.5rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--section-label-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>{heading}</div>
      <p style={{ margin: '0 0 1.4rem', color: 'var(--text-secondary)', maxWidth: '52ch', lineHeight: 1.6 }}>{lead}</p>
      <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {doubles.map(d => (
          <div key={d.key} style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }} aria-hidden="true">{d.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{d.name}</div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{d.does}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
