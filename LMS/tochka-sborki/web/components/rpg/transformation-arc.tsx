import { buildTransformationArc } from '@/lib/rpg/macro-phases'
import type { Locale } from '@/lib/intake/types'

export function TransformationArc({ currentSlug, locale, accent }: { currentSlug: string | null; locale: Locale; accent: string }) {
  const vm = buildTransformationArc(currentSlug, locale)
  const heading = locale === 'en' ? 'Your transformation arc' : 'Твоя арка трансформации'
  return (
    <section aria-label={heading} style={{ maxWidth: 520, margin: '0 auto' }}>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{heading}</p>
      <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {vm.phases.map(p => (
          <li key={p.key} aria-current={p.isCurrent ? 'step' : undefined}
              style={{ border: `1px solid ${p.isCurrent ? accent : 'var(--border-color)'}`, borderRadius: 8, padding: '0.5rem 0.6rem', background: p.isCurrent ? 'var(--bg-surface)' : 'transparent', opacity: p.isCurrent ? 1 : 0.7 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{locale === 'en' ? `Phase ${p.index}` : `Фаза ${p.index}`}</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {locale === 'en' ? `from ${p.frustration} → to ${p.desire}` : `из ${p.frustration} → в ${p.desire}`}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
