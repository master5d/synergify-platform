import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/registry'
import { courseCard } from '../lib/course/living-practice'

interface Props { locale: Locale }

const GOLD = 'var(--accent)'

// Лендинг v2: схема ai.synergify.com (hero → для кого → программа → правила →
// автор → FAQ), но тон манифеста закрытой школы: без обещаний, цифр и scarcity.
// motion 1 — ни одной анимации; вся навигация — цвет ссылок.

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase',
  letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '0 0 1.5rem',
}

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)',
  padding: '1.5rem', textDecoration: 'none', background: 'var(--bg-surface)', display: 'block',
}

export function AcademyPage({ locale }: Props) {
  const t = getDictionary(locale).academy
  // living-practice живёт ЗДЕСЬ (внутренняя карточка ниже) — его registry-запись
  // (coming-soon, контрактный домен) на лендинге академии не показываем, иначе дубль.
  const courses = getCourses(locale).filter((c) => c.slug !== 'living-practice')
  const first = courseCard(locale)
  const trainersHref = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'
  const charterHref = locale === 'en' ? '/en/pravila/' : '/pravila/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .academy-hero { padding: 4rem 1.25rem 3rem !important; }
          .academy-hero h1 { font-size: clamp(2.2rem, 11vw, 4.5rem) !important; }
          .academy-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>

      {/* 1 · HERO — wordmark, голос владельца, gate-CTA */}
      <section className="academy-hero" style={{ padding: '7rem 2rem 5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '0.05em', margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
          {t.wordmark}
        </h1>
        <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.08em', margin: '0 0 2.5rem' }}>
          {t.fullName}
        </p>
        <div style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'left' }}>
          {t.positioning.map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>{p}</p>
          ))}
          <div style={{ border: '1px solid var(--accent)', borderRadius: 'var(--radius)', marginTop: '1.6rem', padding: '1rem', background: 'var(--accent-wash)' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.85rem' }}>{t.gate}</p>
            <a href="https://ai.synergify.com" style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'lowercase' }}>
              {t.gateCta}
            </a>
          </div>
        </div>
      </section>

      {/* 2 · ДЛЯ КОГО — стадии пути, не мотивы */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.forWhoLabel}</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {t.forWho.map((w, i) => (
            <li
              key={w.title}
              style={{
                padding: '1.25rem 0',
                borderTop: i === 0 ? '1px solid var(--accent-line)' : '1px solid var(--border-soft)',
              }}
            >
              <h3 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                {w.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: 0 }}>
                {w.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 · КУРСЫ — практика, registry, тренажёры */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.coursesLabel}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <a href={first.href} aria-label={first.name} style={cardStyle}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{first.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{first.tagline}</div>
          </a>
          {courses.map((c) =>
            c.status === 'live' ? (
              <a
                key={c.slug}
                href={c.url}
                aria-label={c.name}
                target="_blank"
                rel="noopener noreferrer"
                style={cardStyle}
              >
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{c.tagline}</div>
              </a>
            ) : (
              <div
                key={c.slug}
                style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '1.5rem', background: 'var(--bg-surface-muted)' }}
              >
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-faint)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{c.tagline}</div>
                <span style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase' }}>{t.comingSoon}</span>
              </div>
            ),
          )}
          <a href={trainersHref} aria-label={t.trainersCard.name} style={cardStyle}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>{t.trainersCard.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>{t.trainersCard.tagline}</div>
          </a>
        </div>
      </section>

      {/* 4 · ПРАВИЛА ДОМА — мост к хартии */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.charterSectionLabel}</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '0 0 1rem' }}>
          {t.charterBridge}
        </p>
        <a href={charterHref} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none' }}>
          {t.charterLabel}
        </a>
      </section>

      {/* 5 · ОСНОВАТЕЛЬ — коротко, без регалий */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.founderLabel}</h2>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--text-base)', margin: '0 0 0.6rem' }}>
          {t.founderName}
        </p>
        {t.founderBody.map((p, i) => (
          <p key={i} style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '0 0 0.6rem' }}>{p}</p>
        ))}
        <a href="https://mamaev.coach" target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none' }}>
          {t.founderLink}
        </a>
      </section>

      {/* 6 · FAQ — честные ответы, без аккордеонов (motion 1) */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 6rem' }}>
        <h2 style={sectionLabel}>{t.faqLabel}</h2>
        <dl style={{ margin: 0 }}>
          {t.faq.map((item, i) => (
            <div
              key={item.q}
              style={{
                padding: '1.25rem 0',
                borderTop: i === 0 ? '1px solid var(--accent-line)' : '1px solid var(--border-soft)',
              }}
            >
              <dt style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                {item.q}
              </dt>
              <dd style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', margin: 0 }}>
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
