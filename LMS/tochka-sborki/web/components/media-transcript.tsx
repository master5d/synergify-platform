// components/media-transcript.tsx
// Shared, dependency-free transcript disclosure. Renders below a video player.
// Returns null when there is no transcript → dark-ship.

const LABEL = { ru: 'Транскрипт', en: 'Transcript' } as const

export function MediaTranscript({ text, locale }: { text: string | null; locale: 'ru' | 'en' }) {
  if (!text) return null
  return (
    <details
      style={{
        margin: '0.9rem 0 2rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        background: 'var(--bg-surface)',
        padding: '0.6rem 1rem',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {LABEL[locale]}
      </summary>
      <div
        style={{
          marginTop: '0.8rem',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </div>
    </details>
  )
}
