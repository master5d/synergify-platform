import Link from 'next/link'
import type { MaterialGroup, MaterialKind } from '@/lib/materials'
import type { Locale } from '@/lib/dictionaries'

const ICON: Record<MaterialKind, string> = { template: '📄', link: '🔗', tool: '🛠' }

// Generic Course Materials renderer — driven by a MaterialGroup[] manifest, reusable by any course.
export function MaterialsSection({ groups, locale }: { groups: MaterialGroup[]; locale: Locale }) {
  const heading = locale === 'en' ? 'Course Materials' : 'Материалы курса'

  return (
    <section style={{ marginTop: '3rem' }}>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', marginBottom: '1.25rem' }}>
        {heading}
      </h2>
      {groups.map(g => (
        <div key={g.label.en} style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.6rem' }}>
            {g.label[locale === 'en' ? 'en' : 'ru']}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
            {g.items.map(it => {
              const label = it.title[locale === 'en' ? 'en' : 'ru']
              const desc = it.description?.[locale === 'en' ? 'en' : 'ru']
              const row = (
                <span style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
                  <span aria-hidden="true">{ICON[it.kind]}</span>
                  <span>
                    <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>{label}</span>
                    {it.external && <span style={{ color: 'var(--text-secondary)' }}> ↗</span>}
                    {desc && <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{desc}</span>}
                  </span>
                </span>
              )
              const style: React.CSSProperties = { textDecoration: 'none', fontSize: '0.95rem' }
              return (
                <li key={it.href}>
                  {it.external ? (
                    <a href={it.href} target="_blank" rel="noopener noreferrer" style={style}>{row}</a>
                  ) : it.kind === 'template' ? (
                    <a href={it.href} download style={style}>{row}</a>
                  ) : (
                    <Link href={it.href} style={style}>{row}</Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
