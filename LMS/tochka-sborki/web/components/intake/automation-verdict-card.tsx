'use client'
import { useEffect } from 'react'
import type { Answers, Locale } from '@/lib/intake/types'
import { automationInputFromAnswers, evaluateAutomation, type AutomationVerdict } from '@/lib/intake/automation-check'
import { buildAutomationCheckContent } from '@/lib/intake/automation-check-content'

// Шаг «Стоит ли это вообще автоматизировать?» (module V, после V_OUTCOME и четырёх
// likert-вопросов V_AUTO_*) — не вопрос с вариантами, а карточка-вывод: считает окупаемость
// из уже данных ответов и показывает вердикт. Персистится тем же путём, что остальные ответы
// анкеты — через onChange(verdict), тот же setAnswer, что у <QuestionRenderer>.
export function AutomationVerdictCard(
  { locale, answers, onChange }: { locale: Locale; answers: Answers; onChange: (v: AutomationVerdict) => void },
) {
  const input = automationInputFromAnswers(answers)
  const result = input ? evaluateAutomation(input) : null
  const c = buildAutomationCheckContent(locale)

  useEffect(() => {
    if (result && answers['V_AUTO_VERDICT'] !== result.verdict) onChange(result.verdict)
  }, [result?.verdict])

  const badgeColor: Record<AutomationVerdict, string> = {
    automate: 'var(--text-accent)',
    partial: 'var(--text-secondary)',
    skip: 'var(--text-secondary)',
  }

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem 1.4rem', background: 'var(--bg-surface)' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem',
      }}>
        {c.eyebrow}
      </div>

      {!result ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{c.incomplete}</p>
      ) : (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '1.1rem' }}>{c.lead}</p>

          <div style={{
            display: 'inline-block', padding: '0.35rem 0.8rem', borderRadius: 999, fontWeight: 700,
            fontSize: '0.85rem', color: 'var(--text-on-accent)', background: badgeColor[result.verdict],
            marginBottom: '0.8rem',
          }}>
            {c.verdicts[result.verdict].badge}
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.verdicts[result.verdict].headline}</h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.55, marginBottom: '1rem' }}>
            {c.verdicts[result.verdict].body}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem',
          }}>
            <div>
              <div>{locale === 'en' ? 'Time now' : 'Сейчас тратишь'}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {Math.round(result.hoursSavedOverHorizon * 10) / 10} {c.hourUnit} / {result.horizonMonths} {c.monthUnit}
              </div>
            </div>
            <div>
              <div>{locale === 'en' ? 'Build estimate' : 'Сборка (оценка)'}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {result.buildHours} {c.hourUnit}
              </div>
            </div>
            <div>
              <div>{locale === 'en' ? 'Payback' : 'Окупаемость'}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {result.paybackMonths === null
                  ? '—'
                  : `${Math.round(result.paybackMonths * 10) / 10} ${c.monthUnit}`}
              </div>
            </div>
          </div>

          {result.buildTimeUncertain && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.9rem' }}>{c.uncertainBuild}</p>
          )}
        </>
      )}
    </div>
  )
}
