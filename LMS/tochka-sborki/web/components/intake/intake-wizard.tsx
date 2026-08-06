'use client'
import { useEffect, useState } from 'react'
import { getQuestions, getModuleIntros } from '@/lib/intake/instrument'
import { visibleQuestions } from '@/lib/intake/visible'
import { QuestionRenderer } from './question-renderer'
import type { Answers, AnswerValue, InstrumentVersion, Locale } from '@/lib/intake/types'
import { CharterReveal } from './charter-reveal'
import { OnboardingBridge } from './onboarding-bridge'
import { IntakeGate } from './intake-gate'
import { buildCompanionCharter } from '@/lib/intake/charter'
import { deriveMbti } from '@/lib/intake/mbti'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import type { WorldSkin } from '@/lib/rpg/types'

export function IntakeWizard({ locale }: { locale: Locale }) {
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [version, setVersion] = useState<InstrumentVersion>(2) // new students default to v2
  const [charter, setCharter] = useState<string | null>(null)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [showBridge, setShowBridge] = useState(false)
  // Clarity-gate: shown once at a fresh start (step 0, no saved answers), before the first question.
  const [gateDismissed, setGateDismissed] = useState(false)
  // Gate render on saved-progress fetch settling — avoids flashing the gate/Q1 to resuming students.
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.instrument_version === 1) setVersion(1) // returning v1 student stays on v1
        if (d.answers) { setAnswers(JSON.parse(d.answers)); setStep(d.current_step ?? 0) }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const QUESTIONS = getQuestions(version)
  const MODULE_INTROS = getModuleIntros(version)

  const visible = visibleQuestions(QUESTIONS, answers)
  const total = visible.length

  // Keep step within range if the visible set shrinks (e.g. conditional questions).
  useEffect(() => {
    if (step > total - 1) setStep(Math.max(0, total - 1))
  }, [total, step])

  const q = visible[Math.min(step, total - 1)]

  function persist(a: Answers, s: number) {
    fetch('/api/intake/progress', { method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: a, currentStep: s, instrumentVersion: version }) }).catch(() => {})
  }

  // Update answer locally only; progress is persisted on step changes (not per keystroke).
  function setAnswer(v: AnswerValue) {
    setAnswers(prev => ({ ...prev, [q.id]: v }))
  }

  // Free-text companion for "other"-style options, stored under a derived key.
  const otherKey = q ? `${q.id}__other` : ''
  function setOther(v: string) {
    setAnswers(prev => ({ ...prev, [otherKey]: v }))
  }

  function goTo(nextStep: number) {
    const s = Math.max(0, Math.min(nextStep, total - 1))
    setStep(s)
    persist(answers, s)
  }

  async function finish() {
    setSubmitting(true)
    const res = await fetch('/api/intake/submit', { method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, locale }) })
    if (res.ok) {
      const { redirect } = await res.json()
      const href = locale === 'en' ? '/en' + redirect : redirect
      if (version === 2) {
        const skinKey = answers['V_SKIN'] as WorldSkin | undefined
        const meta = skinKey ? SKINS_META[skinKey] : undefined
        setCharter(buildCompanionCharter({
          locale,
          skinName: meta?.displayName[locale] ?? null,
          mentorName: meta?.mentor?.name[locale] ?? null,
          niche: answers['V_NICHE'] as string | undefined,
          outcome: answers['V_OUTCOME'] as string | undefined,
          mbti: deriveMbti(answers),
          relational: { rhythm: (answers['V_RHYTHM'] as any) ?? null, errorStyle: (answers['V_ERR'] as any) ?? null, anchor: (answers['V_ANCHOR'] as any) ?? null, attention: (answers['V_ATTN'] as any) ?? null },
        }))
        setPendingHref(href)
      } else window.location.replace(href)
    } else setSubmitting(false)
  }

  if (charter && showBridge) {
    const skinKey = answers['V_SKIN'] as WorldSkin | undefined
    return <OnboardingBridge skin={skinKey ?? 'wanderer'} locale={locale} onEnter={() => { if (pendingHref) window.location.replace(pendingHref) }} />
  }
  if (charter) return <CharterReveal charter={charter} locale={locale} onContinue={() => setShowBridge(true)} />
  if (!loaded) return null
  // Fresh start (no saved answers) → plain-language clarity-gate before the first RPG question.
  if (!gateDismissed && step === 0 && Object.keys(answers).length === 0)
    return <IntakeGate locale={locale} onEnter={() => setGateDismissed(true)} />
  if (!q) return null
  const isLast = step === total - 1
  const answered = answers[q.id] != null && answers[q.id] !== '' && !(Array.isArray(answers[q.id]) && (answers[q.id] as string[]).length === 0)
  const moduleMeta = MODULE_INTROS.find(m => m.id === q.module)
  const moduleTitle = moduleMeta?.title[locale] ?? ''
  // Show the (authored) module intro on the first visible question of each module —
  // gives the magic-link → quest jump context, and sets expectations of length.
  const isModuleStart = visible.findIndex(v => v.module === q.module) === Math.min(step, total - 1)
  const optionalSkip = !q.required && !answered

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '2.5rem 1.25rem 4rem' }}>
      <style>{`
        .intake-field {
          width: 100%;
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 13px 14px;
          font-size: 16px;
          line-height: 1.45;
          font-family: inherit;
          outline: none;
        }
        .intake-field::placeholder { color: var(--text-secondary); }
        .intake-field:focus { border-color: var(--text-accent); }
        textarea.intake-field { resize: vertical; }

        .intake-option {
          display: block;
          width: 100%;
          text-align: left;
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 10px;
          font-size: 15px;
          line-height: 1.4;
          cursor: pointer;
          transition: border-color .12s, background .12s;
        }
        .intake-option:active { transform: scale(0.995); }
        .intake-option.is-on {
          border-color: var(--text-accent);
          background: color-mix(in oklab, var(--text-accent) 14%, var(--bg-surface));
          color: var(--text-primary);
          font-weight: 600;
        }

        .intake-likert {
          flex: 1;
          min-height: 52px;
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          font-size: 17px;
          cursor: pointer;
        }
        .intake-likert.is-on {
          border-color: var(--text-accent);
          background: color-mix(in oklab, var(--text-accent) 18%, var(--bg-surface));
          font-weight: 700;
        }

        .intake-nav-btn {
          background: var(--bg-surface);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 15px;
          cursor: pointer;
        }
        .intake-nav-btn:disabled { opacity: .4; cursor: default; }
        .intake-nav-btn.primary {
          background: var(--text-accent);
          color: var(--text-on-accent);
          border-color: var(--text-accent);
          font-weight: 700;
        }
      `}</style>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.7rem', color: 'var(--text-secondary)' }}>
        {moduleTitle} · {step + 1}/{total}
      </div>
      <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 2, margin: '.5rem 0 1.5rem' }}>
        <div style={{ height: '100%', width: `${((step + 1) / total) * 100}%`, background: 'var(--text-accent)', borderRadius: 2 }} />
      </div>
      {isModuleStart && moduleMeta?.intro[locale] && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '.95rem', lineHeight: 1.5, marginBottom: '1.4rem' }}>
          {moduleMeta.intro[locale]}
        </p>
      )}
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem', lineHeight: 1.3 }}>{q.prompt[locale]}</h1>
      <QuestionRenderer
        question={q}
        locale={locale}
        value={answers[q.id]}
        onChange={setAnswer}
        otherValue={answers[otherKey] as string | undefined}
        onOtherChange={setOther}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: '2rem' }}>
        <button className="intake-nav-btn" disabled={step === 0} onClick={() => goTo(step - 1)}>← {locale === 'en' ? 'Back' : 'Назад'}</button>
        {isLast
          ? <button className="intake-nav-btn primary" disabled={(q.required && !answered) || submitting} onClick={finish}>{submitting ? (locale === 'en' ? 'Saving…' : 'Сохраняю…') : (locale === 'en' ? 'Finish →' : 'Завершить →')}</button>
          : <button className="intake-nav-btn primary" disabled={q.required && !answered} onClick={() => goTo(step + 1)}>{optionalSkip ? (locale === 'en' ? 'Skip →' : 'Пропустить →') : (locale === 'en' ? 'Next →' : 'Далее →')}</button>}
      </div>
    </main>
  )
}
