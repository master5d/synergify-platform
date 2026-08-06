import Link from 'next/link'
import type { ModuleMeta } from '@/lib/content'
import type { Locale } from '@/lib/dictionaries'

// Generic curriculum tree: module → units. Data-driven from getAllModules, so any course
// renders its full syllabus without bespoke markup.
export function SyllabusTree({ modules, locale }: { modules: ModuleMeta[]; locale: Locale }) {
  const prefix = locale === 'en' ? '/en' : ''
  const unitsLabel = locale === 'en' ? 'units' : 'юнитов'

  return (
    <div>
      {modules.map((m, mi) => (
        <section key={m.slug} style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={`${prefix}/lessons/${m.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', marginRight: '0.5rem' }}>
                  {String(mi).padStart(2, '0')}
                </span>
                {m.title}
              </h2>
            </Link>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {m.duration ? `${m.duration} · ` : ''}{(m.units?.length ?? 0)} {unitsLabel}
            </span>
          </div>
          {m.description && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 0.9rem', maxWidth: '70ch' }}>
              {m.description}
            </p>
          )}
          <ol style={{ listStyle: 'none', margin: '0.6rem 0 0', padding: 0, display: 'grid', gap: '0.35rem' }}>
            {(m.units ?? []).map((u, ui) => (
              <li key={u.slug}>
                <Link href={`${prefix}/lessons/${m.slug}/${u.slug}/`} style={{
                  display: 'flex', gap: '0.6rem', alignItems: 'baseline', textDecoration: 'none',
                  color: 'var(--text-secondary)', fontSize: '0.92rem', padding: '0.2rem 0',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)' }}>
                    {String(mi).padStart(2, '0')}.{ui + 1}
                  </span>
                  <span>{u.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
