import Link from 'next/link'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { CourseSwitcher } from '@/components/academy/course-switcher'

interface Props {
  locale?: Locale
  /** Topic list to render (slug + title). If omitted, topics column is empty. */
  topics?: { slug: string; title: string }[]
  /** Show the prominent "get certificate" CTA button. Off for reference pages
   *  (roadmap, cheatsheet) where it's contextually irrelevant. */
  showCertificateCta?: boolean
}

const REPO_URL = 'https://github.com/master5d/tochka-sborki'

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

export function Footer({ locale = 'ru', topics = [], showCertificateCta = true }: Props = {}) {
  const t = getDictionary(locale).footer
  const prefix = locale === 'en' ? '/en' : ''
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '4rem 2rem 2rem',
      marginTop: '6rem',
    }}>
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>

        {/* ── Top: brand + tagline ───────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '3rem',
          flexWrap: 'wrap',
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '3rem',
        }}>
          <div style={{ maxWidth: '420px' }}>
            <Link href={`${prefix}/`} style={{
              fontFamily: 'var(--font-display), system-ui, sans-serif',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              textDecoration: 'none',
              lineHeight: 1,
              display: 'inline-block',
              marginBottom: '1rem',
            }}>
              ⬡ {getDictionary(locale).nav.brand}
            </Link>
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {t.tagline}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
              margin: '1rem 0 0',
            }}>
              <span aria-hidden="true">⬡ </span>{t.presentedBy}
            </p>
          </div>

          {/* Certificate CTA — hidden on reference pages */}
          {showCertificateCta && (
            <Link href={`${prefix}/certificate/`} style={{
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--text-accent)',
              color: 'var(--text-accent)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              ◆ {getDictionary(locale).nav.certificate}
            </Link>
          )}
        </div>

        {/* ── Middle: 4 columns ──────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Topics */}
          <div>
            <span style={labelStyle}>{t.topicsLabel}</span>
            {topics.map(m => (
              <Link
                key={m.slug}
                href={`${prefix}/lessons/${m.slug}/`}
                style={linkStyle}
              >
                {m.title}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <span style={labelStyle}>{t.resourcesLabel}</span>
            <Link href={`${prefix}/roadmap/`} style={linkStyle}>
              {getDictionary(locale).nav.roadmap}
            </Link>
            <Link href={`${prefix}/cheatsheet/`} style={linkStyle}>
              {getDictionary(locale).nav.cheatsheet}
            </Link>
            <Link href={`${prefix}/exercises/`} style={linkStyle}>
              {locale === 'en' ? 'Exercises' : 'Упражнения'}
            </Link>
            <Link href={`${prefix}/certificate/`} style={linkStyle}>
              {getDictionary(locale).nav.certificate}
            </Link>
          </div>

          {/* Author */}
          <div>
            <span style={labelStyle}>{t.authorLabel}</span>
            <span style={{ ...linkStyle, color: 'var(--text-primary)' }}>
              {t.authorName}
            </span>
            <Link href={`${prefix}/feedback/`} style={linkStyle}>
              {t.sendFeedback}
            </Link>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {t.githubRepo}
            </a>
          </div>

          {/* Project */}
          <div>
            <span style={labelStyle}>{t.courseLabel}</span>
            <a
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {t.licenseFull}
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {t.viewSource}
            </a>
            <a
              href="https://mamaev.coach"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              mamaev.coach ↗
            </a>
          </div>

          <CourseSwitcher locale={locale} />
        </div>

        {/* ── Bottom strip ───────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.05em',
          }}>
            © {year} · {t.license} · {t.rights}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--section-label-size)',
            color: 'var(--text-secondary)',
          }}>
            <span aria-hidden="true">⬡ </span>{t.builtWith}
          </div>
        </div>
      </div>
    </footer>
  )
}
