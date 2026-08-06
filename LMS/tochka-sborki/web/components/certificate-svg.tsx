'use client'

import { forwardRef } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { resolveCertificate, CERT_PALETTE } from '@/lib/course/certificate'

interface Props {
  name: string
  date: string
  locale: Locale
}

export const CertificateSVG = forwardRef<SVGSVGElement, Props>(
  function CertificateSVG({ name, date, locale }, ref) {
    const t = resolveCertificate(locale)
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
        <text x={W / 2} y="240" textAnchor="middle" className="serif" fontSize="40" fill={gold}>
          {t.heading}
        </text>

        {/* presented to */}
        <text x={W / 2} y="320" textAnchor="middle" className="mono" fontSize="12" fill={muted} letterSpacing="3">
          {t.presentedTo}
        </text>

        {/* Name + gold underline */}
        <text x={W / 2} y="392" textAnchor="middle" className="serif" fontSize="44" fill={primary}>
          {name}
        </text>
        <line x1={W / 2 - 180} y1="414" x2={W / 2 + 180} y2="414" stroke={gold} strokeWidth="1.5" opacity="0.85" />

        {/* for completing + course */}
        <text x={W / 2} y="470" textAnchor="middle" className="mono" fontSize="12" fill={muted} letterSpacing="1.5">
          {t.forCompleting}
        </text>
        <text x={W / 2} y="506" textAnchor="middle" className="serif-i" fontSize="28" fill={primary}>
          {t.courseName}
        </text>

        {/* Milestone (symbolic) */}
        {milestoneLines.map((ln, i) => (
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
        <g transform={`translate(${W / 2}, 700)`} stroke={gold} fill="none">
          <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" strokeWidth="1.5" opacity="0.9" />
          <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" strokeWidth="1" opacity="0.6" />
          <circle r="3" fill={gold} stroke="none" />
        </g>

        {/* Founder signature block */}
        <text x={W / 2} y="828" textAnchor="middle" className="serif-i" fontSize="28" fill={primary}>
          {t.founderName}
        </text>
        <line x1={W / 2 - 90} y1="845" x2={W / 2 + 90} y2="845" stroke={goldDim} strokeWidth="1" opacity="0.7" />
        <text x={W / 2} y="868" textAnchor="middle" className="mono" fontSize="10" fill={muted} letterSpacing="1.5">
          {t.founderTitle}
        </text>

        {/* Footer */}
        <text x={W / 2} y={H - 108} textAnchor="middle" className="mono" fontSize="11" fill={muted} letterSpacing="2">
          {date} · {t.footerMeta}
        </text>
        <text x={W / 2} y={H - 82} textAnchor="middle" className="mono-b" fontSize="10" fill={gold} letterSpacing="1.5">
          {t.publisher}
        </text>
        <text x={W / 2} y={H - 60} textAnchor="middle" className="mono" fontSize="10" fill={muted} letterSpacing="2">
          {t.url}
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
