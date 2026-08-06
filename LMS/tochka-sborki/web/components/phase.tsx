'use client'

import { useUnitWizard } from './unit-wizard-context'
import { PHASE_META, phaseLabel, phaseMarker, phaseKolb, type PhaseType } from './phase-chrome'

const PHASE_ORDER: PhaseType[] = ['activation', 'reflection', 'concept', 'practice']

interface Props {
  type: PhaseType
  children: React.ReactNode
}

export function Phase({ type, children }: Props) {
  const { currentStep, locale } = useUnitWizard()
  const stepIndex = PHASE_ORDER.indexOf(type)

  if (stepIndex !== currentStep) return null

  const { icon, color } = PHASE_META[type]
  const label = phaseLabel(type, locale)
  const marker = phaseMarker(type, locale)
  const kolb = phaseKolb(type, locale)

  return (
    <div>
      <div title={kolb} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: `${color}18`,
        borderLeft: `3px solid ${color}`,
        padding: '4px 14px',
        borderRadius: '0 4px 4px 0',
        marginBottom: marker ? '0.5rem' : '1.5rem',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
      }}>
        {icon} {label}
      </div>
      {marker && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
        }}>
          {marker}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
