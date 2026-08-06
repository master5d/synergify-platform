'use client'
import { useState, useEffect } from 'react'
import type { Stack } from './agent-block'

interface StackCard {
  key: Stack
  glyph: string
  name: string
  tagline: string
  when: string
  tools: string[]
  price: string
  accent: 'lime' | 'cyan' | 'amber' | 'magenta'
}

const STACKS: StackCard[] = [
  {
    key: 'claude',
    glyph: '🤖',
    name: 'Claude Code',
    tagline: 'Max capability, paid',
    when: 'Бюджет ≥$20/мес, нужна максимальная способность, нет ограничений по доступу',
    tools: ['Claude Code CLI', 'Anthropic API (Opus / Sonnet)', 'MCP-серверы', 'Hooks / Skills / Subagents'],
    price: '~$20+/мес',
    accent: 'lime',
  },
  {
    key: 'sovereign',
    glyph: '🛡️',
    name: 'Sovereign',
    tagline: 'Полный суверенитет, по SOVERN v3.3',
    when: 'Есть GPU или Mac M-series. Хочешь zero-vendor-lock-in. Готов настраивать',
    tools: ['Hermes (boss-orchestrator)', 'Aider / Cline (workers)', 'llama-server + Qwen3-Coder-30B', 'LiteLLM gateway'],
    price: '$0 софт + железо',
    accent: 'cyan',
  },
  {
    key: 'cloud-oss',
    glyph: '☁️',
    name: 'Cloud-OSS',
    tagline: 'Бюджетный mix free-clouds',
    when: 'Нет своего железа, бюджет ограничен, но доступ к интернету есть',
    tools: ['Cline + OpenRouter', 'Aider + Cerebras/Groq free', 'Qwen / DeepSeek-Coder', 'Gemini Flash'],
    price: '$0–5/мес',
    accent: 'amber',
  },
  {
    key: 'behind-gfw',
    glyph: '🌏',
    name: 'Behind GFW',
    tagline: 'В Китае, без VPN',
    when: 'Anthropic / OpenAI заблокированы. Нужны провайдеры с маршрутами в КНР',
    tools: ['Cerebras free (доступен)', 'Gemini Flash (через mainland)', 'local llama-server', 'Hermes как orchestrator'],
    price: '$0',
    accent: 'magenta',
  },
]

const ACCENT_COLORS: Record<StackCard['accent'], { border: string; bg: string; text: string }> = {
  lime:    { border: 'rgba(0, 255, 136, 0.5)', bg: 'rgba(0, 255, 136, 0.05)', text: 'rgb(0, 255, 136)' },
  cyan:    { border: 'rgba(80, 200, 255, 0.5)', bg: 'rgba(80, 200, 255, 0.05)', text: 'rgb(80, 200, 255)' },
  amber:   { border: 'rgba(255, 180, 84, 0.5)', bg: 'rgba(255, 180, 84, 0.05)', text: 'rgb(255, 180, 84)' },
  magenta: { border: 'rgba(255, 100, 200, 0.5)', bg: 'rgba(255, 100, 200, 0.05)', text: 'rgb(255, 100, 200)' },
}

interface Props {
  interactive?: boolean
}

export function StackMatrix({ interactive = true }: Props) {
  const [stored, setStored] = useState<Stack | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let raw: string | null = null
    try { raw = localStorage.getItem('stack') } catch { /* ignore */ }
    if (raw && STACKS.some(s => s.key === raw)) setStored(raw as Stack)
    setReady(true)
  }, [])

  function pick(next: Stack) {
    if (!interactive) return
    try { localStorage.setItem('stack', next) } catch { /* ignore */ }
    setStored(next)
  }

  return (
    <div>
      <style>{`
        @media (max-width: 720px) {
          .stack-matrix-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="stack-matrix-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        margin: '1.5rem 0 2rem',
      }}>
        {STACKS.map(s => {
          const colors = ACCENT_COLORS[s.accent]
          const active = ready && stored === s.key
          const Tag = interactive ? 'button' : 'div'
          return (
            <Tag
              key={s.key}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => pick(s.key) : undefined}
              aria-pressed={interactive ? active : undefined}
              style={{
                display: 'block',
                textAlign: 'left',
                background: active ? colors.bg : 'var(--bg-surface)',
                border: '1px solid ' + (active ? colors.border : 'var(--border-color)'),
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                cursor: interactive ? 'pointer' : 'default',
                width: '100%',
                fontFamily: 'inherit',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                }}>
                  <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>{s.glyph}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: colors.text,
                  }}>
                    {s.name}
                  </span>
                </div>
                {active && (
                  <span aria-label="выбранный стек" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    ● ваш
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                marginBottom: '0.75rem',
              }}>
                {s.tagline}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                lineHeight: 1.55,
              }}>
                <strong style={{ color: colors.text, fontWeight: 600 }}>Когда:</strong> {s.when}
              </div>
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '0.75rem',
              }}>
                {s.tools.map((t, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.4rem' }}>
                    <span aria-hidden="true">▸</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: colors.text,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                paddingTop: '0.5rem',
                borderTop: '1px dashed var(--border-color)',
              }}>
                {s.price}
              </div>
            </Tag>
          )
        })}
      </div>
      {interactive && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          margin: '0 0 1.5rem',
        }}>
          {ready && stored
            ? <>● Текущий выбор: <strong style={{ color: ACCENT_COLORS[STACKS.find(s => s.key === stored)!.accent].text }}>{STACKS.find(s => s.key === stored)?.name}</strong>. Кликни другую карточку чтобы переключиться.</>
            : <>💡 Кликни карточку — её стек запомнится и AgentBlock-секции в следующих уроках будут фильтроваться под него.</>}
        </p>
      )}
    </div>
  )
}
