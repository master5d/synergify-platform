import Link from 'next/link'
import { getAllModules } from '@/lib/content'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { ProgramVenn } from '@/components/program-venn'
import { EcosystemDiagram } from '@/components/ecosystem-diagram'
import { getEcosystem } from '@/lib/course/ecosystem'
import { FaqAccordion } from '@/components/faq-accordion'
import { HeroSecondaryCta } from '@/components/hero-secondary-cta'
import { ChatVsSystem } from '@/components/chat-vs-system'
import { BeforeAfter } from '@/components/before-after'
import { DreamScenarios } from '@/components/dream-scenarios'
import { ShowcaseGallery } from '@/components/showcase-gallery'

const lessonsHref = (locale: Locale, slug: string) =>
  locale === 'en' ? `/en/lessons/${slug}/` : `/lessons/${slug}/`
const feedbackHref = (locale: Locale) => locale === 'en' ? '/en/feedback/' : '/feedback/'
const programAnchor = '#program'

interface Props { locale: Locale }

export function HomePage({ locale }: Props) {
  const t = getDictionary(locale)
  const modules = getAllModules(locale)

  return (
    <>
      <Nav locale={locale} />
      <style>{`
        @media (max-width: 720px) {
          .home-hero { padding: 3rem 1.25rem 3rem !important; }
          .home-author { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .home-author-img { max-width: 280px; margin: 0 auto; }
          .home-program-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .home-program-card { padding: 1.25rem 0 !important; gap: 1rem !important; }
          .home-program-card h3 { font-size: 1.2rem !important; }
          .home-program-aside { min-width: auto !important; }
          .home-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>
      <main id="main-content" tabIndex={-1}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="home-hero" style={{
        padding: '5rem 2rem 4rem',
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
      }}>
        <div
          aria-label={t.hero.tagline.replace(/^[^\wА-Яа-я]+/, '')}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--section-label-size)',
            color: 'var(--text-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '1.5rem',
          }}
        >
          {t.hero.tagline}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 'clamp(3.5rem, 12vw, 10rem)',
          fontWeight: 900,
          lineHeight: 0.85,
          color: 'var(--text-primary)',
          marginBottom: '2rem',
          textTransform: 'uppercase',
          letterSpacing: '-0.06em',
          fontStretch: '100%',
        }}>
          {t.hero.titleLine1}<br />{t.hero.titleLine2}
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.4vw, 1.35rem)',
          fontWeight: 700,
          color: 'var(--text-accent)',
          maxWidth: '560px',
          lineHeight: 1.4,
          marginBottom: '1.5rem',
          letterSpacing: '-0.01em',
        }}>
          {t.hero.slogan}
        </p>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          lineHeight: 1.7,
          marginBottom: '1.25rem',
        }}>
          {t.hero.subtitle}
        </p>

        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.04em',
          marginBottom: '2.5rem',
        }}>
          <span aria-hidden="true">⬡ </span>{t.footer.presentedBy}
        </p>

        <div style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {t.hero.stats.map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-accent)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={programAnchor} style={{
            display: 'inline-block',
            padding: '0.875rem 2.5rem',
            background: 'var(--text-accent)',
            color: 'var(--text-on-accent)',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
          }}>
            {t.hero.cta}
          </a>
          <HeroSecondaryCta locale={locale} />
          {/* Третий путь для сомневающегося: не «войти» и не «программа»,
              а сделать одно дело своими руками до всякой записи. */}
          <Link href={`${locale === 'en' ? '/en' : ''}/try/`} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}>
            {t.hero.ctaTry}
          </Link>
        </div>
      </section>

      <ChatVsSystem locale={locale} />

      {/* ── ДЛЯ КОГО ─────────────────────────────────────────── */}
      <section className="home-section" style={{
        padding: 'var(--section-gap) 2rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--section-label-size)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '1rem',
          }}>
            {t.forWhoLabel}
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: '3rem',
            lineHeight: 1,
          }}>
            {t.forWhoHeading}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {t.forWho.map(item => (
              <div key={item.title} style={{ paddingTop: '1rem', borderTop: 'var(--accent-line)' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.03em',
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
          <p style={{
            marginTop: '3rem',
            fontSize: 'clamp(1.05rem, 2.2vw, 1.35rem)',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            maxWidth: '60ch',
          }}>
            {t.forWhoTagline}
          </p>
        </div>
      </section>

      <BeforeAfter locale={locale} />

      <ProgramVenn locale={locale} />
      <EcosystemDiagram data={getEcosystem(locale)} locale={locale} />

      {/* ── ПРОГРАММА ────────────────────────────────────────── */}
      <section id="program" className="home-program-section" style={{ padding: 'var(--section-gap) 2rem', scrollMarginTop: '2rem' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--section-label-size)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '3rem',
          }}>
            {t.program.sectionLabel}
          </div>
          {modules.map(m => (
            <Link key={m.slug} href={lessonsHref(locale, m.slug)} className="home-program-card" style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1.5rem',
              alignItems: 'baseline',
              padding: '1.75rem 0',
              borderBottom: '1px solid var(--border-color)',
              color: 'inherit',
              transition: 'opacity 0.2s',
              textDecoration: 'none',
            }}>
              <div>
                <h3 style={{
                  fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                }}>
                  {m.title}
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  maxWidth: '60ch',
                }}>
                  {m.description}
                </p>
              </div>
              <div className="home-program-aside" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.75rem',
                minWidth: '80px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '0.25rem 0.55rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  whiteSpace: 'nowrap',
                }}>
                  {m.duration}
                </span>
                <span aria-hidden="true" style={{ color: 'var(--text-accent)', fontSize: '1.25rem', lineHeight: 1 }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <DreamScenarios locale={locale} />
      <ShowcaseGallery locale={locale} />

      {/* ── ОБ АВТОРЕ ────────────────────────────────────────── */}
      <section className="home-section" style={{
        padding: 'var(--section-gap) 2rem',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div className="home-author" style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '4rem',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--section-label-size)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1rem',
            }}>
              {t.author.label}
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              lineHeight: 0.95,
              marginBottom: '1.5rem',
              whiteSpace: 'pre-line',
            }}>
              {t.author.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem' }}>
              {t.author.bio}
            </p>
            <Link href={feedbackHref(locale)} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {t.author.cta}
            </Link>
          </div>
          <div className="home-author-img" style={{
            aspectRatio: '4/5',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            width: '100%',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/author.jpg"
              alt={t.author.name.replace(/\n/g, ' ')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="home-section" style={{
        padding: 'var(--section-gap) 2rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--section-label-size)',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '2rem',
          }}>
            {t.faq.label}
          </div>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <FaqAccordion items={t.faq.items} />
          </div>
        </div>
      </section>

      </main>
      <Footer locale={locale} topics={modules.map(m => ({ slug: m.slug, title: m.title }))} />
    </>
  )
}
