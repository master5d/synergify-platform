import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/registry'
import { DragonOrnament } from './dragon-ornament'

interface Props { locale: Locale }

// Домашняя страница школы, дизайн «weave» (academy-weave.dc.html, Claude Design,
// принят владельцем 2026-08-07). Светлая бумага + тёмные полосы-врезки; полное
// имя школы вместо акронима; дракон — несущий орнамент; motion 1 (ни одной
// анимации, только смена цвета на ховере — классы в themes/academy.css).

const EYEBROW: React.CSSProperties = {
  fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-ink)',
}
const EYEBROW_GOLD: React.CSSProperties = { ...EYEBROW, color: 'var(--accent)' }
const DISPLAY: React.CSSProperties = {
  fontFamily: 'var(--font-display), sans-serif', fontWeight: 200, letterSpacing: '-0.03em', margin: 0,
}
const SHELL: React.CSSProperties = { maxWidth: '1240px', margin: '0 auto' }

function Dot({ gold = true }: { gold?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: '7px', height: '7px', borderRadius: '50%', display: 'block',
        background: gold ? 'var(--accent)' : 'transparent',
        border: gold ? undefined : '1px solid var(--text-faint)',
      }}
    />
  )
}

export function AcademyPage({ locale }: Props) {
  const t = getDictionary(locale).academy
  // living-practice живёт ЗДЕСЬ (карточка ниже) — его registry-запись
  // (coming-soon, контрактный домен) на этой странице не показываем, иначе дубль.
  const courses = getCourses(locale).filter((c) => c.slug !== 'living-practice')
  const practice = t.practiceCard
  const trainersHref = locale === 'en' ? '/en/trenazhery/' : '/trenazhery/'
  const charterHref = locale === 'en' ? '/en/pravila/' : '/pravila/'

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`
        @media (max-width: 900px) {
          .w-pad { padding-left: 22px !important; padding-right: 22px !important; }
          .w-2col, .w-3col, .w-hero-grid, .w-founder, .w-faq { grid-template-columns: 1fr !important; }
          .w-row { grid-template-columns: 48px 1fr !important; gap: 16px !important; }
          .w-row p { grid-column: 2 !important; }
          .w-rules { padding: 36px 26px 40px !important; gap: 24px !important; }
          .w-nav { display: none !important; }
        }
      `}</style>

      {/* ── ШАПКА: якоря + дверь входа ─────────────────────────────── */}
      <header
        className="w-pad"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px',
          padding: '22px 40px', borderBottom: '1px solid var(--border-color)',
          position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 20,
        }}
      >
        <nav className="w-nav" style={{ display: 'flex', gap: '26px', fontSize: '14px' }}>
          <a className="a-nav-link" href="#manifest">{t.nav.manifest}</a>
          <a className="a-nav-link" href="#inside">{t.nav.inside}</a>
          <a className="a-nav-link" href="#courses">{t.nav.courses}</a>
          <a className="a-nav-link" href="#faq">{t.nav.faq}</a>
        </nav>
        <a className="a-btn-dark" href="https://ai.synergify.com" style={{ padding: '11px 22px', fontSize: '14px', borderRadius: 'var(--radius)' }}>
          {t.nav.cta}
        </a>
      </header>

      {/* ── ИМЯ ШКОЛЫ + ДРАКОН + ВХОД ──────────────────────────────── */}
      <section className="w-pad" style={{ ...SHELL, padding: '104px 40px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <Dot />
          <span style={EYEBROW}>{t.subline}</span>
        </div>
        <h1 style={{
          margin: 0, fontFamily: 'var(--font-wordmark), sans-serif', fontWeight: 700,
          fontSize: 'clamp(34px, 4.7vw, 74px)', lineHeight: 1.1, letterSpacing: '-0.015em', maxWidth: '15ch',
        }}>
          {t.fullName}
        </h1>

        <DragonOrnament width={600} opacity={0.62} style={{ margin: '52px auto 0' }} />

        <div className="w-hero-grid" style={{
          display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,0.85fr)',
          gap: '72px', marginTop: '56px', alignItems: 'start',
        }}>
          <p style={{ margin: 0, fontSize: '21px', lineHeight: 1.62, color: 'var(--text-body)', textWrap: 'pretty' }}>
            {t.positioning[0]}
          </p>
          <div style={{
            borderLeft: '2px solid var(--accent)', paddingLeft: '28px',
            display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'flex-start',
          }}>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{t.gate}</p>
            <a className="a-btn-dark" href="https://ai.synergify.com" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '17px 30px', fontSize: '16px', borderRadius: 'var(--radius)',
            }}>
              {t.gateCta}
            </a>
          </div>
        </div>
      </section>

      {/* ── МАНИФЕСТ: тёмная врезка, голос владельца целиком ────────── */}
      <section id="manifest" className="w-pad a-invert" style={{ background: 'var(--bg-invert)', color: 'var(--text-on-invert)', padding: '104px 40px' }}>
        <div className="w-2col" style={{
          ...SHELL, display: 'grid', gridTemplateColumns: 'minmax(0,0.72fr) minmax(0,1.28fr)',
          gap: '80px', alignItems: 'start',
        }}>
          <div>
            <div style={{ ...EYEBROW_GOLD, marginBottom: '24px' }}>{t.manifestLabel}</div>
            <p style={{ ...DISPLAY, fontSize: 'clamp(26px, 2.6vw, 38px)', lineHeight: 1.24, letterSpacing: '-0.02em' }}>
              {t.manifestPull}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '66ch' }}>
            {t.positioning.slice(1).map((p, i) => (
              <p key={i} style={{
                margin: 0,
                fontSize: i === 0 ? '22px' : '18px',
                lineHeight: i === 0 ? 1.58 : 1.68,
                color: i === 0 ? 'var(--text-on-invert)' : 'var(--text-on-invert-soft)',
                textWrap: 'pretty',
              }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── ЧТО ВНУТРИ / ЭТОГО ЗДЕСЬ НЕТ ───────────────────────────── */}
      <section id="inside" className="w-pad" style={{ ...SHELL, padding: '104px 40px' }}>
        <div style={{ ...EYEBROW, marginBottom: '22px' }}>{t.inside.label}</div>
        <h2 style={{ ...DISPLAY, marginBottom: '60px', fontSize: 'clamp(28px, 3.4vw, 50px)', lineHeight: 1.16, maxWidth: '18ch' }}>
          {t.inside.heading}
        </h2>
        <div className="w-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '40px 40px 46px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <Dot />
              <span style={{ ...EYEBROW, fontSize: '13px', letterSpacing: '0.18em' }}>{t.inside.inLabel}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {t.inside.items.map((item, i) => (
                <li key={item} style={{
                  fontSize: '19px', lineHeight: 1.5,
                  paddingBottom: i === t.inside.items.length - 1 ? 0 : '20px',
                  borderBottom: i === t.inside.items.length - 1 ? undefined : '1px solid var(--border-soft)',
                }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ border: '1px dashed var(--text-faint)', padding: '40px 40px 46px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
              <Dot gold={false} />
              <span style={{ ...EYEBROW, fontSize: '13px', letterSpacing: '0.18em', color: 'var(--text-muted)' }}>{t.inside.outLabel}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-muted)' }}>
              {t.inside.excluded.map((item, i) => (
                <li key={item} style={{
                  fontSize: '19px', lineHeight: 1.5,
                  paddingBottom: i === t.inside.excluded.length - 1 ? 0 : '20px',
                  borderBottom: i === t.inside.excluded.length - 1 ? undefined : '1px solid var(--border-soft)',
                }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── ДЛЯ КОГО: нумерованные строки ───────────────────────────── */}
      <section id="who" className="w-pad" style={{ ...SHELL, padding: '0 40px 104px' }}>
        <div style={{ ...EYEBROW, marginBottom: '40px' }}>{t.forWhoLabel}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {t.forWho.map((w, i) => (
            <div
              key={w.title}
              className="w-row"
              style={{
                display: 'grid', gridTemplateColumns: '72px minmax(0,1fr) minmax(0,1.15fr)',
                gap: '32px', padding: '34px 0', alignItems: 'start',
                borderTop: '1px solid var(--border-color)',
                borderBottom: i === t.forWho.length - 1 ? '1px solid var(--border-color)' : undefined,
              }}
            >
              <span aria-hidden="true" style={{ ...DISPLAY, fontSize: '34px', color: 'var(--accent)', lineHeight: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 400, lineHeight: 1.3 }}>{w.title}</h3>
              <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.62, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КУРСЫ: двери школы ─────────────────────────────────────── */}
      <section id="courses" className="w-pad" style={{ ...SHELL, padding: '0 40px 104px' }}>
        <div style={{ ...EYEBROW, marginBottom: '40px' }}>{t.coursesLabel}</div>
        <div className="w-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '24px' }}>
          {/* Точка Сборки и прочие live-курсы из registry — тёмной картой (дверь входа) */}
          {courses.map((c) => (
            c.status === 'live' ? (
              <a
                key={c.slug}
                className="a-card-dark"
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '44px',
                  minHeight: '280px', padding: '36px 34px', borderRadius: 'var(--radius)',
                }}
              >
                <span style={EYEBROW_GOLD}>{t.courseEyebrows.entry}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ ...DISPLAY, fontWeight: 300, fontSize: '26px', lineHeight: 1.2 }}>{c.name}</span>
                  <span style={{ fontSize: '17px', lineHeight: 1.55, color: 'var(--text-on-invert-soft)' }}>{c.tagline}</span>
                </span>
              </a>
            ) : (
              <div
                key={c.slug}
                style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '44px',
                  minHeight: '280px', padding: '36px 34px', borderRadius: 'var(--radius)',
                  border: '1px dashed var(--text-faint)',
                }}
              >
                <span style={{ ...EYEBROW, color: 'var(--text-muted)' }}>{t.comingSoon}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ ...DISPLAY, fontWeight: 300, fontSize: '26px', lineHeight: 1.2, color: 'var(--text-secondary)' }}>{c.name}</span>
                  <span style={{ fontSize: '17px', lineHeight: 1.55, color: 'var(--text-muted)' }}>{c.tagline}</span>
                </span>
              </div>
            )
          ))}

          <a className="a-card-light" href={practice.href} style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '44px',
            minHeight: '280px', padding: '36px 34px', borderRadius: 'var(--radius)', color: 'var(--text-primary)',
          }}>
            <span style={EYEBROW}>{t.courseEyebrows.practice}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ ...DISPLAY, fontWeight: 300, fontSize: '26px', lineHeight: 1.2 }}>{practice.name}</span>
              <span style={{ fontSize: '17px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{practice.tagline}</span>
            </span>
          </a>

          <a className="a-card-light" href={trainersHref} style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '44px',
            minHeight: '280px', padding: '36px 34px', borderRadius: 'var(--radius)', color: 'var(--text-primary)',
          }}>
            <span style={EYEBROW}>{t.courseEyebrows.trainers}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ ...DISPLAY, fontWeight: 300, fontSize: '26px', lineHeight: 1.2 }}>{t.trainersCard.name}</span>
              <span style={{ fontSize: '17px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{t.trainersCard.tagline}</span>
            </span>
          </a>
        </div>
      </section>

      {/* ── ПРАВИЛА ДОМА: полоса ───────────────────────────────────── */}
      <section id="rules" className="w-pad" style={{ ...SHELL, padding: '0 40px 104px' }}>
        <div className="w-2col w-rules" style={{
          background: 'var(--bg-band)', padding: '56px 56px 60px', display: 'grid',
          gridTemplateColumns: 'minmax(0,0.72fr) minmax(0,1.28fr)', gap: '64px', alignItems: 'center',
        }}>
          <div style={EYEBROW}>{t.charterSectionLabel}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', alignItems: 'flex-start' }}>
            <p style={{ margin: 0, fontSize: '24px', lineHeight: 1.5, textWrap: 'pretty', maxWidth: '58ch' }}>
              {t.charterBridge}
            </p>
            <a className="a-link" href={charterHref} style={{ fontSize: '16px' }}>{t.charterLabel}</a>
          </div>
        </div>
      </section>

      {/* ── ОСНОВАТЕЛЬ ─────────────────────────────────────────────── */}
      <section id="founder" className="w-pad" style={{ ...SHELL, padding: '0 40px 104px' }}>
        <div style={{ ...EYEBROW, marginBottom: '40px' }}>{t.founderLabel}</div>
        <div className="w-founder" style={{ display: 'grid', gridTemplateColumns: '230px minmax(0,1fr)', gap: '56px', alignItems: 'start' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/author.jpg"
            alt={t.founderName}
            style={{ width: '100%', maxWidth: '230px', height: 'auto', display: 'block', borderRadius: 'var(--radius)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start', maxWidth: '54ch' }}>
            <div style={{ ...DISPLAY, fontWeight: 300, fontSize: '28px' }}>{t.founderName}</div>
            {t.founderBody.map((p, i) => (
              <p key={i} style={{ margin: 0, fontSize: '19px', lineHeight: 1.62, color: 'var(--text-body)', textWrap: 'pretty' }}>{p}</p>
            ))}
            <a className="a-link" href="https://mamaev.coach" target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px' }}>
              {t.founderLink}
            </a>
          </div>
        </div>
      </section>

      {/* ── ВОПРОСЫ ────────────────────────────────────────────────── */}
      <section id="faq" className="w-pad" style={{ ...SHELL, padding: '0 40px 104px' }}>
        <div style={{ ...EYEBROW, marginBottom: '40px' }}>{t.faqLabel}</div>
        <dl className="w-faq" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 56px', margin: 0 }}>
          {t.faq.map((item) => (
            <div key={item.q} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <dt style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 500, lineHeight: 1.3 }}>{item.q}</dt>
              <dd style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── ДРАКОН-СТРАЖ У ВЫХОДА ──────────────────────────────────── */}
      <div className="w-pad" style={{ ...SHELL, padding: '0 40px 64px' }}>
        <DragonOrnament width={380} opacity={0.35} flip />
      </div>

      {/* ── ФУТЕР ──────────────────────────────────────────────────── */}
      <footer className="w-pad a-invert" style={{ background: 'var(--bg-invert)', color: 'var(--text-on-invert)', padding: '72px 40px 52px' }}>
        <div className="w-2col" style={{ ...SHELL, display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: '64px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '44ch' }}>
            <div style={{ fontFamily: 'var(--font-wordmark), sans-serif', fontWeight: 700, fontSize: '23px', lineHeight: 1.34, letterSpacing: '-0.01em' }}>
              {t.fullName}
            </div>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--text-on-invert-soft)' }}>{t.footer.tagline}</p>
          </div>
          <div>
            <div style={{ ...EYEBROW_GOLD, letterSpacing: '0.18em', textTransform: 'none', marginBottom: '22px' }}>{t.footer.linksLabel}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px', fontSize: '16px' }}>
              {t.footer.links.map((l) => (
                <a key={l.href} className="a-footer-link" href={l.href}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ ...SHELL, marginTop: '52px', paddingTop: '24px', borderTop: '1px solid var(--border-invert)', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--text-on-invert-faint)' }}>
          {t.footer.rights}
        </div>
      </footer>
    </div>
  )
}
