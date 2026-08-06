import { getDictionary, type Locale } from '@/lib/dictionaries'

interface Props { locale?: Locale }

export function ProgramVenn({ locale = 'ru' }: Props = {}) {
  const t = getDictionary(locale).venn
  const ITEMS = t.items
  const EXCLUDED = t.excluded
  const cx1 = 150, cy = 160, r = 118, cx2 = 286
  const overlapCx = (cx1 + r + cx2 - r) / 2
  const rightCx = (cx1 + r + cx2 + r) / 2
  const W = cx2 + r + 32
  const H = cy * 2 + 24

  return (
    <section style={{
      padding: 'var(--section-gap) 2rem',
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      overflow: 'hidden',
    }}>
      <style>{`
        .venn-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        @media (max-width: 720px) {
          .venn-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .venn-mobile-excluded { display: flex !important; }
          .venn-svg-wrap { display: none !important; }
        }
      `}</style>

      {/* Screen-reader semantic version of the Venn diagram */}
      <div className="venn-sr-only">
        <h3>{t.heading.replace('\n', ' ')}</h3>
        <p>{t.inLabel1} {t.inLabel2}:</p>
        <ul>
          {t.items.map((item, i) => <li key={`in-${i}`}>{item}</li>)}
        </ul>
        <p>{t.outLabel1} {t.outLabel2}:</p>
        <ul>
          {t.excluded.map((item, i) => <li key={`out-${i}`}>{item}</li>)}
        </ul>
      </div>

      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>

        {/* Section label */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--section-label-size)',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '1rem',
        }}>
          {t.label}
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 3rem)',
          fontWeight: 900,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
          marginBottom: '3rem',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          <span style={{ whiteSpace: 'pre-line' }}>{t.heading}</span>
        </h2>

        <div className="venn-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>

          {/* ── Left: editorial list ──────────────────────────── */}
          <ol style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {ITEMS.map((text, i) => (
              <li key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1.25rem 1fr',
                gap: '0.75rem',
                alignItems: 'baseline',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid var(--border-color)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--text-accent)',
                  lineHeight: 1.5,
                }}>
                  ▸
                </span>
                <span style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                }}>
                  {text}
                </span>
              </li>
            ))}
          </ol>

          {/* ── Right: programmatic Venn ──────────────────────── */}
          <div>
            <div className="venn-svg-wrap">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ display: 'block', overflow: 'visible' }}
              aria-hidden="true"
            >
              <defs>
                {/* Subtle grid pattern */}
                <pattern id="venn-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                </pattern>
                {/* Inner overlap fill clip */}
                <clipPath id="venn-clip">
                  <circle cx={cx2} cy={cy} r={r} />
                </clipPath>
              </defs>

              {/* Grid background */}
              <rect x="0" y="0" width={W} height={H} fill="url(#venn-grid)" />

              {/* Tick marks at top (coordinate scale) */}
              {[cx1, overlapCx, cx2, cx2 + r].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1={4} x2={x} y2={12} stroke="rgba(0,255,136,0.4)" strokeWidth="0.8" />
                  <text x={x} y={22} textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fill="rgba(0,255,136,0.45)" letterSpacing="0.1em">
                    {['C1', 'INT', 'C2', 'END'][i]}
                  </text>
                </g>
              ))}

              {/* Overlap zone — accent fill */}
              <circle cx={cx1} cy={cy} r={r}
                fill="rgba(0,255,136,0.07)"
                stroke="none"
                clipPath="url(#venn-clip)" />

              {/* Left circle — INCLUDED (dashed green) */}
              <circle cx={cx1} cy={cy} r={r}
                fill="none"
                stroke="rgba(0,255,136,0.55)"
                strokeWidth="1.2"
                strokeDasharray="3 3" />

              {/* Right circle — EXCLUDED (solid muted) */}
              <circle cx={cx2} cy={cy} r={r}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.2" />

              {/* Crosshair: left circle center */}
              <g stroke="rgba(0,255,136,0.6)" strokeWidth="0.8">
                <line x1={cx1 - 4} y1={cy} x2={cx1 + 4} y2={cy} />
                <line x1={cx1} y1={cy - 4} x2={cx1} y2={cy + 4} />
              </g>
              <text x={cx1} y={cy - 70} textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fill="rgba(0,255,136,0.55)" letterSpacing="0.15em">
                {t.scope}
              </text>

              {/* Crosshair: right circle center */}
              <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.8">
                <line x1={cx2 - 4} y1={cy} x2={cx2 + 4} y2={cy} />
                <line x1={cx2} y1={cy - 4} x2={cx2} y2={cy + 4} />
              </g>
              <text x={cx2} y={cy - 70} textAnchor="middle" fontSize="6.5" fontFamily="var(--font-mono)" fill="rgba(255,255,255,0.4)" letterSpacing="0.15em">
                {t.excludedLegend}
              </text>

              {/* Label: "то, что будет" — overlap center */}
              <text x={overlapCx} y={cy - 6}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill="rgb(0,255,136)"
                letterSpacing="0.1em">
                {t.inLabel1}
              </text>
              <text x={overlapCx} y={cy + 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill="rgb(0,255,136)"
                letterSpacing="0.1em">
                {t.inLabel2}
              </text>

              {/* Label: "то, чего не будет" — right circle, non-overlap */}
              <text x={rightCx} y={cy - 16}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill="rgba(255,255,255,0.7)"
                letterSpacing="0.12em">
                {t.outLabel1}
              </text>
              <text x={rightCx} y={cy - 4}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill="rgba(255,255,255,0.7)"
                letterSpacing="0.12em">
                {t.outLabel2}
              </text>

              {/* Exclusion list — inside right circle */}
              {EXCLUDED.map((item, i) => (
                <text key={i}
                  x={rightCx}
                  y={cy + 14 + i * 12}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="var(--font-mono)"
                  fill="rgba(255,255,255,0.35)"
                  letterSpacing="0.04em">
                  · {item}
                </text>
              ))}

              {/* Bottom comment */}
              <text x={W - 4} y={H - 4}
                textAnchor="end"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill="rgba(0,255,136,0.7)"
                letterSpacing="0.08em">
                {t.provoc}
              </text>
            </svg>
            </div>

            {/* Mobile excluded list */}
            <div className="venn-mobile-excluded" style={{
              display: 'none',
              flexDirection: 'column',
              gap: '0.4rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '0.5rem',
              }}>
                {t.mobileExcludedLabel}
              </div>
              {EXCLUDED.map((item, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}>
                  · {item}
                </div>
              ))}
              <div style={{
                marginTop: '1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-accent)',
                letterSpacing: '0.05em',
              }}>
                {t.provoc}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
