'use client'
import { useState } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { agentUrl } from '@/lib/learn-prompt'
import { COMPANION } from '@/lib/course/companion'

// ChatGPT/Claude support `?q=` prefill — they carry the compact bootstrap so the agent
// opens already oriented. Gemini/Copilot have no reliable prefill param, so they open bare
// and rely on the copied full charter.
const AGENTS: { key: string; label: string; url: string; prefill: boolean }[] = [
  { key: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/', prefill: true },
  { key: 'claude', label: 'Claude', url: 'https://claude.ai/new', prefill: true },
  { key: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app', prefill: false },
  { key: 'copilot', label: 'Copilot', url: 'https://copilot.microsoft.com/', prefill: false },
]

// Честное предупреждение (Педагогика 5, intake LMS#20): в полевом RCT ученики с GPT решали практику
// лучше, а на экзамене без ИИ — хуже, и сами этого не замечали (Bastani et al., PNAS 2025).
export const RESEARCH_URL = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12232635/'
export const RESEARCH_CITE = 'Bastani et al., PNAS 2025'

export const T = {
  ru: {
    body: 'Скопируй персональный промпт и вставь его в режим обучения своего агента — он подхватит твой контекст и поведёт тебя дальше.',
    copy: 'Скопировать промпт',
    copied: 'Скопировано ✓',
    modeLabel: 'Режим компаньона',
    learn: 'Учиться',
    practice: 'Практиковаться',
    learnHint: 'Объясняет материал по методике курса.',
    practiceHint: '«Помоги мне практиковаться»: вопросы вместо готового ответа и подсказки по шагам. В «Проверь себя» компаньон не называет ответ, пока ты не ответишь сам.',
    caveat: 'Честно: с ИИ кажется, что умеешь больше, чем без него. После практики проверь себя без ИИ.',
    caveatSource: 'В исследовании школьники с ChatGPT решали практику лучше, а на контрольной без ИИ — хуже, и сами этого не заметили.',
  },
  en: {
    body: 'Copy your personal prompt and paste it into your agent\'s learn mode — it picks up your context and takes you forward.',
    copy: 'Copy prompt',
    copied: 'Copied ✓',
    modeLabel: 'Companion mode',
    learn: 'Learn',
    practice: 'Practice',
    learnHint: 'Explains the material using the course method.',
    practiceHint: '“Help me practice”: questions instead of a ready answer, and step-by-step hints. In “Check yourself” the companion won’t give the answer until you have answered.',
    caveat: 'Honestly: with AI it feels like you can do more than you can without it. After practice, check yourself without AI.',
    caveatSource: 'In the study, students with ChatGPT did better on practice but worse on the test without AI — and did not notice it themselves.',
  },
}

type StudyMode = 'learn' | 'practice'

/**
 * Hands the learner a personalized study system-prompt for their own agent. With `practice`
 * given, a «Учиться / Практиковаться» switch picks which prompt the copy button and the
 * ChatGPT/Claude prefill carry (intake LMS#18) — our LLM is never called.
 */
export function LearnWithAI({ prompt, bootstrap, practice, locale = 'ru' }: {
  prompt: string
  bootstrap?: string
  practice?: { prompt: string; bootstrap?: string }
  locale?: Locale
}) {
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<StudyMode>('learn')
  const t = T[locale === 'en' ? 'en' : 'ru']
  const active = mode === 'practice' && practice ? practice : { prompt, bootstrap }

  const track = (agent: string) => {
    // @ts-expect-error analytics global is optional
    if (typeof window !== 'undefined') window.plausible?.('learn_with_ai_clicked', { props: { agent, mode: 'inline', studyMode: mode } })
  }
  const hrefFor = (a: typeof AGENTS[number]) =>
    a.prefill && active.bootstrap ? agentUrl(a.key as 'chatgpt' | 'claude', active.bootstrap) : a.url
  const copy = async () => {
    track('copy')
    try {
      await navigator.clipboard.writeText(active.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — agent buttons still open */ }
  }

  const primary: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
    padding: '0.6rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
    border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)',
  }
  const ghost: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
    padding: '0.6rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none',
    border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-accent)',
  }

  return (
    <section style={{
      marginTop: '2.5rem', padding: '1.5rem',
      border: '1px solid var(--border-color)', borderRadius: 'var(--radius)',
      background: 'var(--bg-surface)',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
        {COMPANION.label[locale === 'en' ? 'en' : 'ru']}
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 1.1rem' }}>
        {t.body}
      </p>
      <p data-testid="lwai-caveat" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5, margin: '-0.4rem 0 1.1rem' }}>
        {t.caveat}{' '}
        <a href={RESEARCH_URL} target="_blank" rel="noopener" title={t.caveatSource} aria-label={`${RESEARCH_CITE}. ${t.caveatSource}`}
          style={{ color: 'var(--text-secondary)', textDecoration: 'underline dotted', whiteSpace: 'nowrap' }}>
          ({RESEARCH_CITE})
        </a>
      </p>
      {practice && (
        <div style={{ margin: '0 0 0.9rem' }}>
          <div role="group" aria-label={t.modeLabel} style={{ display: 'inline-flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {(['learn', 'practice'] as const).map(m => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => { setMode(m); setCopied(false) }}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                  padding: '0.45rem 0.9rem', border: 'none', cursor: 'pointer',
                  background: mode === m ? 'var(--text-accent)' : 'transparent',
                  color: mode === m ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                }}
              >
                {m === 'learn' ? t.learn : t.practice}
              </button>
            ))}
          </div>
          <p aria-live="polite" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5, margin: '0.45rem 0 0' }}>
            {mode === 'practice' ? t.practiceHint : t.learnHint}
          </p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={copy} style={primary}>{copied ? t.copied : t.copy}</button>
        {AGENTS.map(a => (
          <a key={a.key} href={hrefFor(a)} target="_blank" rel="noopener" onClick={() => track(a.key)} style={ghost}>
            {a.label} →
          </a>
        ))}
      </div>
    </section>
  )
}
