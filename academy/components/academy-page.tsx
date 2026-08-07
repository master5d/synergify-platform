import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/registry'
import { courseCard } from '../lib/course/living-practice'

interface Props { locale: Locale }

const GOLD = 'var(--accent)'

// Лендинг v3: структурная грамматика ai.synergify.com (hero+stats+CTA →
// сравнение 2 колонки → для-кого сеткой → внутри/не-внутри → курсы → правила →
// основатель с фото → FAQ → футер), но идентичность академии: тьма, золото,
// motion 1 — ни одной анимации, де-hustle, ноль обещаний.

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase',
  letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '0 0 1.5rem',
}

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)', color: 'var(--text-primary)',
  fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '0.03em',
  lineHeight: 1.15, margin: '0 0 2rem', whiteSpace: 'pre-line',
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
          .academy-grid2 { grid-template-columns: 1fr !important; }
          .academy-stats { gap: 1.25rem !important; }
          .academy-founder { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* 1 · HERO — wordmark, первый абзац манифеста, честные stats, две двери */}
      <section className="academy-hero" style={{ padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '0.05em', margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
          {t.wordmark}
        </h1>
        <p style={{ color: GOLD, fontSize: 'var(--text-sm)', letterSpacing: '0.08em', margin: '0 0 2rem' }}>
          {t.fullName}
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '0 auto 2.5rem' }}>
          {t.positioning[0]}
        </p>

        <div className="academy-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', margin: '0 0 2.5rem' }}>
          {t.heroStats.map(([value, label]) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-display)', color: GOLD, fontSize: 'var(--text-xl)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'lowercase', marginTop: '0.4rem' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="https://ai.synergify.com" style={{ border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '0.8rem 1.4rem', background: 'var(--accent-wash)', color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textTransform: 'lowercase', textDecoration: 'none' }}>
            {t.gateCta}
          </a>
          <a href={charterHref} style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '0.8rem 1.4rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textTransform: 'lowercase', textDecoration: 'none' }}>
            {t.charterLabel}
          </a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '1.5rem 0 0' }}>{t.gate}</p>
      </section>

      {/* 2 · ЗАПИСЬ vs КРУГ — двухколоночное сравнение (грамматика chat-vs-system) */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '4rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.compare.label}</h2>
        <p style={sectionHeading}>{t.compare.heading}</p>
        <div className="academy-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-soft)' }}>{t.compare.leftCol}</div>
          <div style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase', paddingBottom: '0.75rem', borderBottom: '1px solid var(--accent-line)' }}>{t.compare.rightCol}</div>
          {t.compare.rows.map((r) => (
            [
              <div key={r.left} style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', padding: '0.9rem 0', borderBottom: '1px solid var(--border-soft)' }}>{r.left}</div>,
              <div key={r.right} style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-base)', padding: '0.9rem 0', borderBottom: '1px solid var(--border-soft)' }}>{r.right}</div>,
            ]
          ))}
        </div>
      </section>

      {/* 3 · ДЛЯ КОГО — сетка 2×2 карточек-стадий */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.forWhoLabel}</h2>
        <div className="academy-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {t.forWho.map((w) => (
            <div key={w.title} style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1.5rem', background: 'var(--bg-surface)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-base)', fontWeight: 600, margin: '0 0 0.5rem', lineHeight: 1.35 }}>
                {w.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-sm)', margin: 0 }}>
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · ВНУТРИ / ЭТОГО ЗДЕСЬ НЕТ — грамматика venn in/out */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.inside.label}</h2>
        <p style={sectionHeading}>{t.inside.heading}</p>
        <div className="academy-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.5rem', background: 'var(--accent-wash)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase', marginBottom: '1rem' }}>{t.inside.inLabel}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {t.inside.items.map((item) => (
                <li key={item} style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-base)', padding: '0.35rem 0' }}>✦ {item}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase', marginBottom: '1rem' }}>{t.inside.outLabel}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {t.inside.excluded.map((item) => (
                <li key={item} style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-base)', padding: '0.35rem 0' }}>— {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5 · МАНИФЕСТ — голос владельца целиком (hero несёт только первый абзац) */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.manifestLabel}</h2>
        <div style={{ maxWidth: '38rem' }}>
          {t.positioning.slice(1).map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>{p}</p>
          ))}
        </div>
      </section>

      {/* 6 · КУРСЫ — практика, registry, тренажёры */}
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
                style={{ border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '1.5rem' }}
              >
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5, marginBottom: '0.6rem' }}>{c.tagline}</div>
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

      {/* 7 · ПРАВИЛА ДОМА — мост к хартии */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.charterSectionLabel}</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '0 0 1rem' }}>
          {t.charterBridge}
        </p>
        <a href={charterHref} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none' }}>
          {t.charterLabel}
        </a>
      </section>

      {/* 8 · ОСНОВАТЕЛЬ — фото + крупное имя (грамматика автор-блока ТС) */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.founderLabel}</h2>
        <div className="academy-founder" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/author.jpg"
            alt={t.founderName}
            style={{ width: '100%', maxWidth: '220px', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)', display: 'block' }}
          />
          <div>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '0.02em', margin: '0 0 1rem', lineHeight: 1.2 }}>
              {t.founderName}
            </p>
            {t.founderBody.map((p, i) => (
              <p key={i} style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 0.6rem' }}>{p}</p>
            ))}
            <a href="https://mamaev.coach" target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none' }}>
              {t.founderLink}
            </a>
          </div>
        </div>
      </section>

      {/* 9 · FAQ — честные ответы, без аккордеонов (motion 1) */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 5rem' }}>
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

      {/* 10 · ФУТЕР */}
      <footer style={{ borderTop: '1px solid var(--border-soft)' }}>
        <div className="academy-section academy-grid2" style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'var(--text-lg)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{t.wordmark}</div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: 'var(--text-sm)', margin: 0, maxWidth: '24rem' }}>{t.footer.tagline}</p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'lowercase', marginBottom: '0.75rem' }}>{t.footer.linksLabel}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {t.footer.links.map((l) => (
                <li key={l.href} style={{ padding: '0.2rem 0' }}>
                  <a href={l.href} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 2rem 2rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.06em', margin: 0 }}>{t.footer.rights}</p>
        </div>
      </footer>
    </main>
  )
}
