'use client'

import { forwardRef } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { resolveCertificate, CERT_PALETTE } from '@/lib/course/certificate'

/** Одна строка перечня освоенного: трансформация модуля «от → к». */
export interface CertificateEvidenceLine { from: string; to: string }

interface Props {
  name: string
  date: string
  locale: Locale
  /** Пройденные модули спайна (только подтверждённые платформой). Пусто — прежний «золотой билет». */
  evidence?: CertificateEvidenceLine[]
  /** Сколько модулей в спайне — знаменатель счёта «освоено N / M». */
  evidenceTotal?: number
  /** Публичный адрес проверки; есть — печатается мелко в подвале вместо адреса курса. */
  verifyUrl?: string
}

const EVIDENCE_COPY = {
  ru: { mastered: 'ОСВОЕНО', modules: 'МОДУЛЕЙ', verify: 'проверка' },
  en: { mastered: 'MASTERED', modules: 'MODULES', verify: 'verify' },
}

// Геометрия. Без улик — прежняя раскладка билета; с уликами верх сжимается, и на месте
// двустрочного «milestone» встаёт перечень: «от» выровнено вправо к стрелке, «к» — влево,
// чтобы девять строк читались столбцом, а не рваной центровкой.
const LAYOUT = {
  ticket:   { heading: 240, headingSize: 40, presented: 320, name: 392, nameSize: 44, underline: 414, forCompleting: 470, course: 506, courseSize: 28, seal: 700, founder: 828 },
  evidence: { heading: 192, headingSize: 36, presented: 246, name: 306, nameSize: 40, underline: 326, forCompleting: 368, course: 400, courseSize: 26, seal: 718, founder: 800 },
} as const
export const EVIDENCE_TOP = 450      // подпись «ОСВОЕНО · N / M»
export const EVIDENCE_ROW0 = 492     // первая строка перечня
export const EVIDENCE_STEP = 22
export const EVIDENCE_FONT = 12
export const EVIDENCE_GAP = 16       // от стрелки до «от»/«к»
export const EVIDENCE_MAX_ROWS = 9
export const VERIFY_FONT = 8        // ~130 знаков адреса проверки в 650px моноширинным

export const CertificateSVG = forwardRef<SVGSVGElement, Props>(
  function CertificateSVG({ name, date, locale, evidence = [], evidenceTotal, verifyUrl }, ref) {
    const t = resolveCertificate(locale)
    const ec = EVIDENCE_COPY[locale]
    const lines = evidence.slice(0, EVIDENCE_MAX_ROWS)
    const hasEvidence = lines.length > 0
    const L = hasEvidence ? LAYOUT.evidence : LAYOUT.ticket
    const footerUrl = verifyUrl ? `${ec.verify} · ${verifyUrl.replace(/^https?:\/\//, '')}` : t.url
    const W = 800
    const H = 1000
    const { bg, gold, goldDim, primary, muted, border } = CERT_PALETTE
    const milestoneLines = t.milestone.split('\n')

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', maxWidth: '560px', margin: '0 auto' }}
      >
        <defs>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Geist+Mono:wght@400;700&display=swap');
            .brand   { font-family: 'Unbounded', system-ui, sans-serif; font-weight: 900; }
            .serif   { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; }
            .serif-i { font-family: 'Playfair Display', Georgia, serif; font-weight: 600; font-style: italic; }
            .mono    { font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 400; }
            .mono-b  { font-family: 'Geist Mono', ui-monospace, monospace; font-weight: 700; }
          `}</style>
          <radialGradient id="cert-glow" cx="50%" cy="30%" r="62%">
            <stop offset="0%" stopColor={gold} stopOpacity="0.10" />
            <stop offset="70%" stopColor={gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width={W} height={H} fill={bg} />
        <rect x="0" y="0" width={W} height={H} fill="url(#cert-glow)" />

        {/* Subtle grid */}
        <pattern id="cert-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        </pattern>
        <rect x="0" y="0" width={W} height={H} fill="url(#cert-grid)" />

        {/* Double gold frame */}
        <rect x="40" y="40" width={W - 80} height={H - 80} fill="none" stroke={goldDim} strokeWidth="1" />
        <rect x="48" y="48" width={W - 96} height={H - 96} fill="none" stroke={gold} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.5" />

        {/* Header */}
        <text x="70" y="100" className="brand" fontSize="20" fill={primary} letterSpacing="-1">
          <tspan fill={gold}>◈</tspan> {t.brand}
        </text>
        <text x={W - 70} y="100" textAnchor="end" className="mono-b" fontSize="11" fill={gold} letterSpacing="3">
          {t.ticketLabel}
        </text>
        <line x1="70" y1="115" x2={W - 70} y2="115" stroke={border} strokeWidth="1" />

        {/* Serif heading */}
        <text x={W / 2} y={L.heading} textAnchor="middle" className="serif" fontSize={L.headingSize} fill={gold}>
          {t.heading}
        </text>

        {/* presented to */}
        <text x={W / 2} y={L.presented} textAnchor="middle" className="mono" fontSize="12" fill={muted} letterSpacing="3">
          {t.presentedTo}
        </text>

        {/* Name + gold underline */}
        <text x={W / 2} y={L.name} textAnchor="middle" className="serif" fontSize={L.nameSize} fill={primary}>
          {name}
        </text>
        <line x1={W / 2 - 180} y1={L.underline} x2={W / 2 + 180} y2={L.underline} stroke={gold} strokeWidth="1.5" opacity="0.85" />

        {/* for completing + course */}
        <text x={W / 2} y={L.forCompleting} textAnchor="middle" className="mono" fontSize="12" fill={muted} letterSpacing="1.5">
          {t.forCompleting}
        </text>
        <text x={W / 2} y={L.course} textAnchor="middle" className="serif-i" fontSize={L.courseSize} fill={primary}>
          {t.courseName}
        </text>

        {/* Evidence: what was mastered, «from → to» per completed spine module */}
        {hasEvidence && (
          <g>
            <text x={W / 2} y={EVIDENCE_TOP} textAnchor="middle" className="mono-b" fontSize="11" fill={gold} letterSpacing="3">
              {ec.mastered} · {lines.length}{evidenceTotal ? ` / ${evidenceTotal}` : ''} {ec.modules}
            </text>
            <line x1={W / 2 - 180} y1={EVIDENCE_TOP + 14} x2={W / 2 + 180} y2={EVIDENCE_TOP + 14} stroke={goldDim} strokeWidth="0.75" opacity="0.7" />
            {lines.map((ln, i) => {
              const y = EVIDENCE_ROW0 + i * EVIDENCE_STEP
              return (
                <g key={i}>
                  <text x={W / 2 - EVIDENCE_GAP} y={y} textAnchor="end" className="mono" fontSize={EVIDENCE_FONT} fill={muted}>{ln.from}</text>
                  <text x={W / 2} y={y} textAnchor="middle" className="mono" fontSize={EVIDENCE_FONT} fill={gold}>→</text>
                  <text x={W / 2 + EVIDENCE_GAP} y={y} textAnchor="start" className="mono" fontSize={EVIDENCE_FONT} fill={primary}>{ln.to}</text>
                </g>
              )
            })}
          </g>
        )}

        {/* Milestone (symbolic) — only on the plain ticket */}
        {!hasEvidence && milestoneLines.map((ln, i) => (
          <text
            key={i}
            x={W / 2}
            y={596 + i * 30}
            textAnchor="middle"
            className="mono"
            fontSize="14"
            fill={i === milestoneLines.length - 1 ? gold : muted}
            letterSpacing="0.5"
          >
            {ln}
          </text>
        ))}

        {/* ONE geometric gold motif — concentric diamond seal */}
        <g transform={`translate(${W / 2}, ${L.seal}) scale(${hasEvidence ? 0.75 : 1})`} stroke={gold} fill="none">
          <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" strokeWidth="1.5" opacity="0.9" />
          <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" strokeWidth="1" opacity="0.6" />
          <circle r="3" fill={gold} stroke="none" />
        </g>

        {/* Founder signature block */}
        <text x={W / 2} y={L.founder} textAnchor="middle" className="serif-i" fontSize="28" fill={primary}>
          {t.founderName}
        </text>
        <line x1={W / 2 - 90} y1={L.founder + 17} x2={W / 2 + 90} y2={L.founder + 17} stroke={goldDim} strokeWidth="1" opacity="0.7" />
        <text x={W / 2} y={L.founder + 40} textAnchor="middle" className="mono" fontSize="10" fill={muted} letterSpacing="1.5">
          {t.founderTitle}
        </text>

        {/* Footer */}
        <text x={W / 2} y={H - 108} textAnchor="middle" className="mono" fontSize="11" fill={muted} letterSpacing="2">
          {date} · {t.footerMeta}
        </text>
        <text x={W / 2} y={H - 82} textAnchor="middle" className="mono-b" fontSize="10" fill={gold} letterSpacing="1.5">
          {t.publisher}
        </text>
        <text
          x={W / 2}
          y={H - 60}
          textAnchor="middle"
          className="mono"
          fontSize={verifyUrl ? VERIFY_FONT : 10}
          fill={muted}
          letterSpacing={verifyUrl ? 0 : 2}
        >
          {footerUrl}
        </text>

        {/* Corner ticks */}
        <g stroke={gold} strokeWidth="1.5" opacity="0.7">
          <line x1="40" y1="40" x2="60" y2="40" />
          <line x1="40" y1="40" x2="40" y2="60" />
          <line x1={W - 60} y1="40" x2={W - 40} y2="40" />
          <line x1={W - 40} y1="40" x2={W - 40} y2="60" />
          <line x1="40" y1={H - 40} x2="60" y2={H - 40} />
          <line x1="40" y1={H - 60} x2="40" y2={H - 40} />
          <line x1={W - 60} y1={H - 40} x2={W - 40} y2={H - 40} />
          <line x1={W - 40} y1={H - 60} x2={W - 40} y2={H - 40} />
        </g>
      </svg>
    )
  }
)
