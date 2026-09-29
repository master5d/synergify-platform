'use client'
import { useEffect, useState } from 'react'
import {
  buildRolePlayBootstrap, buildRolePlayPrompt, profileTaskRole, rolePlayAgentUrl, variantFor,
  type RolePlayLocale, type RolePlayScenario,
} from '@/lib/role-play'

// Role Play в практике юнита (intake LMS#18): сценарий автора уходит промптом в агента ученика —
// копированием целиком или prefill-ссылкой ChatGPT/Claude (механика и лимит — как у «Учиться с ИИ»).
// Персонализация: если у сценария есть вариант под роль из анкеты, роль читается на клиенте из
// /api/intake/me — тем же путём, что плашка шага русла. Нет сессии/роли — общий вариант.

const AGENTS: { key: 'chatgpt' | 'claude' | 'gemini' | 'copilot'; label: string; url: string; prefill: boolean }[] = [
  { key: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/', prefill: true },
  { key: 'claude', label: 'Claude', url: 'https://claude.ai/new', prefill: true },
  { key: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app', prefill: false },
  { key: 'copilot', label: 'Copilot', url: 'https://copilot.microsoft.com/', prefill: false },
]

const T = {
  ru: {
    kicker: 'Тренировка в роли',
    body: 'Сыграй сцену со своим агентом: он держит роль персонажа, ты добиваешься цели. В конце агент выйдет из роли и разберёт разговор по критериям ниже. Остановиться можно в любой момент — напиши «стоп».',
    goal: 'Твоя цель',
    criteria: 'По чему будет разбор',
    copy: 'Скопировать сценарий',
    copied: 'Скопировано ✓',
    forRole: { creator: 'Вариант для криэйтора', entrepreneur: 'Вариант для предпринимателя' },
  },
  en: {
    kicker: 'Role play',
    body: 'Play the scene with your own agent: it holds the character, you work toward the goal. At the end the agent steps out of character and reviews the conversation against the criteria below. You can stop any time — just write "stop".',
    goal: 'Your goal',
    criteria: 'What the debrief checks',
    copy: 'Copy scenario',
    copied: 'Copied ✓',
    forRole: { creator: 'Version for creators', entrepreneur: 'Version for entrepreneurs' },
  },
} as const

type Profile = { answers?: unknown } | null

export function RolePlay({ scenario, locale, profile: given }: {
  scenario: RolePlayScenario
  locale: RolePlayLocale
  /** Для тестов рендера: готовый профиль без сети. undefined — загрузить (только если есть варианты под роль). */
  profile?: Profile
}) {
  const [profile, setProfile] = useState<Profile>(given ?? null)
  const [copied, setCopied] = useState(false)
  const personalized = !!scenario.byRole && Object.keys(scenario.byRole).length > 0

  useEffect(() => {
    if (given !== undefined || !personalized) return
    let alive = true
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(p => { if (alive) setProfile(p) })
      .catch(() => {})
    return () => { alive = false }
  }, [given, personalized])

  const t = T[locale]
  const role = personalized ? profileTaskRole(profile) : null
  const hasVariant = !!(role && scenario.byRole?.[role])
  const v = variantFor(scenario, role)
  const prompt = buildRolePlayPrompt(scenario, locale, role)
  const bootstrap = buildRolePlayBootstrap(scenario, locale, role)

  const track = (agent: string) => {
    // @ts-expect-error analytics global is optional
    if (typeof window !== 'undefined') window.plausible?.('role_play_clicked', { props: { agent, scenario: scenario.id, role: hasVariant ? role : 'general' } })
  }
  const copy = async () => {
    track('copy')
    try {
      await navigator.clipboard.writeText(prompt)
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
  const label: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0.9rem 0 0.3rem',
  }

  return (
    <section
      aria-label={`${t.kicker}: ${v.persona[locale]}`}
      style={{
        margin: '1.5rem 0', padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color)', borderLeft: '3px solid var(--text-accent)',
        borderRadius: 'var(--radius)', background: 'var(--bg-surface)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
        {t.kicker} · {v.persona[locale]}
        {hasVariant && role ? <span style={{ color: 'var(--text-secondary)' }}> · {t.forRole[role]}</span> : null}
      </div>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.55, margin: '0 0 0.6rem' }}>
        {v.context[locale]}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
        {t.body}
      </p>
      <div style={label}>{t.goal}</div>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>{scenario.goal[locale]}</p>
      <div style={label}>{t.criteria}</div>
      <ol style={{ paddingLeft: '1.25rem', margin: '0 0 1rem', lineHeight: 1.6, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
        {scenario.criteria.map((c, i) => <li key={i}>{c[locale]}</li>)}
      </ol>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={copy} style={primary}>{copied ? t.copied : t.copy}</button>
        {AGENTS.map(a => (
          <a
            key={a.key}
            href={a.prefill && (a.key === 'chatgpt' || a.key === 'claude') ? rolePlayAgentUrl(a.key, bootstrap) : a.url}
            target="_blank"
            rel="noopener"
            onClick={() => track(a.key)}
            style={ghost}
          >
            {a.label} →
          </a>
        ))}
      </div>
    </section>
  )
}
