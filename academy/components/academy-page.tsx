import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/registry'
import { courseCard } from '../lib/course/living-practice'
import { DragonOrnament } from './dragon-ornament'

interface Props { locale: Locale }

const GOLD = 'var(--accent)'

// Домашняя страница мистической школы (v4) — НЕ лендинг (identity.json: «закрытая
// школа, а не лендинг»). Полное имя вместо акронима (решение владельца 2026-08-07),
// белый дракон как несущий орнамент, motion 1 — ни одной анимации, де-hustle.

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
  // (coming-soon, контрактный домен) на этой странице не показываем, иначе дубль.
  const courses = getCourses(locale).filter((c) => c.slug !== 'living-practice')
  const first = courseCard(locale)
  const trainersHref = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'
  const charterHref = locale === 'en' ? '/en/pravila/' : '/pravila/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .academy-hero { padding: 4rem 1.25rem 3rem !important; }
          .academy-hero h1 { font-size: clamp(1.5rem, 6.5vw, 2.2rem) !important; }
          .academy-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .academy-grid2 { grid-template-columns: 1fr !important; }
          .academy-founder { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* 1 · ИМЯ ШКОЛЫ — полное, без акронима; дракон-хранитель под именем */}
      <section className="academy-hero" style={{ padding: '6rem 2rem 3rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: '0 0 1.5rem' }}>
          {t.subline}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4.2vw, 3.2rem)', letterSpacing: '0.06em', lineHeight: 1.25, margin: '0 auto 2rem', color: 'var(--text-primary)', maxWidth: '46rem' }}>
          {t.fullName}
        </h1>

        <DragonOrnament width={560} opacity={0.65} />

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '2rem auto 0', textAlign: 'left' }}>
          {t.positioning[0]}
        </p>

        <div style={{ maxWidth: '38rem', margin: '2rem auto 0', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '1.25rem', background: 'var(--accent-wash)', textAlign: 'left' }}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.85rem' }}>{t.gate}</p>
          <a href="https://ai.synergify.com" style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textTransform: 'lowercase', textDecoration: 'none' }}>
            {t.gateCta}
          </a>
        </div>
      </section>

      {/* 2 · МАНИФЕСТ — голос владельца целиком */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.manifestLabel}</h2>
        <div style={{ maxWidth: '38rem' }}>
          {t.positioning.slice(1).map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>{p}</p>
          ))}
        </div>
      </section>

      {/* 3 · ВНУТРИ / ЭТОГО ЗДЕСЬ НЕТ — честность школы */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.inside.label}</h2>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', letterSpacing: '0.03em', lineHeight: 1.2, margin: '0 0 2rem' }}>
          {t.inside.heading}
        </p>
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

      {/* 4 · ДЛЯ КОГО — спокойный список стадий */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.forWhoLabel}</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: '38rem' }}>
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

      {/* 5 · КУРСЫ — двери школы */}
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

      {/* 6 · ПРАВИЛА ДОМА — мост к хартии */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.charterSectionLabel}</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', maxWidth: '38rem', margin: '0 0 1rem' }}>
          {t.charterBridge}
        </p>
        <a href={charterHref} style={{ color: GOLD, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: '0.06em', textDecoration: 'none' }}>
          {t.charterLabel}
        </a>
      </section>

      {/* 7 · ОСНОВАТЕЛЬ */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 0' }}>
        <h2 style={sectionLabel}>{t.founderLabel}</h2>
        <div className="academy-founder" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/author.jpg"
            alt={t.founderName}
            style={{ width: '100%', maxWidth: '200px', borderRadius: 'var(--radius)', border: '1px solid var(--border-soft)', display: 'block' }}
          />
          <div>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', letterSpacing: '0.02em', margin: '0 0 1rem', lineHeight: 1.2 }}>
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

      {/* 8 · ВОПРОСЫ */}
      <section className="academy-section" style={{ maxWidth: '52rem', margin: '0 auto', padding: '5rem 2rem 4rem' }}>
        <h2 style={sectionLabel}>{t.faqLabel}</h2>
        <dl style={{ margin: 0, maxWidth: '38rem' }}>
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

      {/* 9 · ДРАКОН-СТРАЖ у выхода + ФУТЕР */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <DragonOrnament width={360} opacity={0.35} flip />
      </div>
      <footer style={{ borderTop: '1px solid var(--border-soft)' }}>
        <div className="academy-section academy-grid2" style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'var(--text-base)', letterSpacing: '0.04em', lineHeight: 1.4, marginBottom: '0.75rem', maxWidth: '20rem' }}>{t.fullName}</div>
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
