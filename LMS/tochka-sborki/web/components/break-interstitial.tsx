'use client'

import { useState } from 'react'
import type { ResolvedBreak } from '@/lib/breaks/types'

interface Props {
  activity: ResolvedBreak | null
  onContinue: () => void
}

// Thin presentational overlay. Renders null when there is no activity (belt-and-suspenders
// with the shouldBreak decider). Always dismissible: clicking the backdrop calls onContinue.
// Passive breaks show a prompt + Continue. Puzzle breaks show a question + choices; picking
// an answer locks the choices, reveals correct/incorrect + a one-line explanation, then offers
// Continue. No score, no streak, no shaming — a gentle pattern-interrupt.
export function BreakInterstitial({ activity, onContinue }: Props) {
  const [picked, setPicked] = useState<number | null>(null)

  if (!activity) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activity.title}
      onClick={onContinue}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', padding: '1.5rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 420, width: '100%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 12, padding: '1.75rem', textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: '0.6rem',
        }}>
          ⏸
        </div>
        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>
          {activity.title}
        </h2>

        {activity.kind === 'passive' ? (
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              {activity.prompt}
            </p>
            <button
              type="button"
              onClick={onContinue}
              style={{
                background: 'var(--text-accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 8, padding: '0.6rem 1.4rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {activity.cta}
            </button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              {activity.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {activity.choices.map((choice, i) => {
                const isCorrect = i === activity.answer
                const isPicked = i === picked
                const answered = picked !== null
                // After answering: highlight the correct choice; mark the wrong pick.
                const mark = answered && isCorrect ? ' ✓' : answered && isPicked ? ' ✗' : ''
                const borderColor = answered && isCorrect
                  ? 'var(--text-accent)'
                  : answered && isPicked
                    ? 'var(--crit, #c0392b)'
                    : 'var(--border-color)'
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={answered}
                    aria-pressed={isPicked}
                    onClick={() => setPicked(i)}
                    style={{
                      background: 'transparent', color: 'var(--text-primary)',
                      border: `1px solid ${borderColor}`, borderRadius: 8,
                      padding: '0.6rem 1rem', textAlign: 'left',
                      cursor: answered ? 'default' : 'pointer',
                      opacity: answered && !isCorrect && !isPicked ? 0.6 : 1,
                    }}
                  >
                    {choice}{mark}
                  </button>
                )
              })}
            </div>
            {picked !== null && (
              <>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem', fontStyle: 'italic' }}>
                  {activity.reveal}
                </p>
                <button
                  type="button"
                  onClick={onContinue}
                  style={{
                    background: 'var(--text-accent)', color: 'var(--bg-primary)',
                    border: 'none', borderRadius: 8, padding: '0.6rem 1.4rem',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {activity.cta}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
