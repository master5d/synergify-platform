import { COURSE } from '@/lib/course'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { resolveOtherCourses } from '@/lib/academy/registry'

// Footer column look — footer.tsx keeps these consts module-local, so the two
// small style objects are duplicated here to stay visually identical.
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-accent)',
  textTransform: 'lowercase',
  letterSpacing: '0.12em',
  marginBottom: '1rem',
  display: 'block',
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  padding: '0.25rem 0',
  textDecoration: 'none',
  lineHeight: 1.5,
}

/** Footer column linking to the academy's OTHER live courses.
 *  Dark-ship: renders null while the registry holds no other live course. */
export function CourseSwitcher({ locale }: { locale: Locale }) {
  const others = resolveOtherCourses(locale, COURSE.domain)
  if (others.length === 0) return null
  const t = getDictionary(locale)
  return (
    <div>
      <span style={labelStyle}>{t.academy.switcherLabel}</span>
      {others.map((c) => (
        <a
          key={c.slug}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {c.name}
        </a>
      ))}
    </div>
  )
}
