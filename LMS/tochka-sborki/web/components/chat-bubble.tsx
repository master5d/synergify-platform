'use client'

import { useTextMeasurement } from '@/lib/use-pretext'

interface Props {
  text: string
  side: 'user' | 'agent'
  maxWidth?: number  // hard cap so bubbles don't span the whole screen
}

const FONT_USER  = "14px 'Geist Mono', ui-monospace, monospace"
const FONT_AGENT = "14.5px Inter, system-ui, sans-serif"

export function ChatBubble({ text, side, maxWidth = 480 }: Props) {
  const font = side === 'user' ? FONT_USER : FONT_AGENT
  const m = useTextMeasurement(text, font, maxWidth, 1.55)

  // Shrinkwrap: use the tightest width that still respects maxWidth.
  // Add horizontal padding (1rem = 16px each side).
  const PAD_X = 16
  const PAD_Y = 12
  const bubbleWidth = m.ready
    ? Math.min(maxWidth, Math.ceil(m.shrunkWidth)) + PAD_X * 2
    : maxWidth

  const isUser = side === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '100%',
        width: m.ready ? bubbleWidth : 'auto',
        padding: `${PAD_Y}px ${PAD_X}px`,
        background: isUser ? 'var(--bg-surface)' : 'transparent',
        border: `1px solid ${isUser ? 'var(--border-color)' : 'var(--text-accent)'}`,
        borderRadius: isUser
          ? '16px 16px 4px 16px'
          : '16px 16px 16px 4px',
        fontFamily: isUser ? 'var(--font-mono)' : 'inherit',
        fontSize: isUser ? '0.875rem' : '0.9rem',
        color: isUser ? 'var(--text-primary)' : 'var(--text-primary)',
        lineHeight: 1.55,
        transition: 'width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        {!isUser && (
          <div style={{
            position: 'absolute',
            top: -8,
            left: 12,
            background: 'var(--bg-secondary)',
            padding: '0 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-accent)',
            letterSpacing: '0.1em',
          }}>
            agent
          </div>
        )}
        {text}
      </div>
    </div>
  )
}
