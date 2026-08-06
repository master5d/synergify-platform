export type Accent = 'lime' | 'cyan' | 'amber' | 'magenta' | 'violet' | 'rose'

export interface AccentColor { border: string; bg: string; text: string }

export interface Segment {
  text: string    // the literal token as it appears in the example
  label: string   // short name of the part (e.g. "роль")
  note: string    // the callout explanation
  accent: Accent
}

export interface AnatomyToken {
  n: number
  text: string
  label: string
  note: string
  color: AccentColor
}

// rgba triples in the same style as StackMatrix.ACCENT_COLORS.
export const ACCENT: Record<Accent, AccentColor> = {
  lime:    { border: 'rgba(0, 255, 136, 0.5)',  bg: 'rgba(0, 255, 136, 0.08)',  text: 'rgb(0, 255, 136)' },
  cyan:    { border: 'rgba(80, 200, 255, 0.5)', bg: 'rgba(80, 200, 255, 0.08)', text: 'rgb(80, 200, 255)' },
  amber:   { border: 'rgba(255, 180, 84, 0.5)', bg: 'rgba(255, 180, 84, 0.08)', text: 'rgb(255, 180, 84)' },
  magenta: { border: 'rgba(255, 100, 200, 0.5)',bg: 'rgba(255, 100, 200, 0.08)',text: 'rgb(255, 100, 200)' },
  violet:  { border: 'rgba(168, 130, 255, 0.5)',bg: 'rgba(168, 130, 255, 0.08)',text: 'rgb(168, 130, 255)' },
  rose:    { border: 'rgba(255, 120, 120, 0.5)',bg: 'rgba(255, 120, 120, 0.08)',text: 'rgb(255, 120, 120)' },
}

// Neutral fallback for an unknown/missing accent — never undefined.
export const FALLBACK: AccentColor = {
  border: 'var(--border-color)', bg: 'var(--bg-surface)', text: 'var(--text-accent)',
}

export function buildAnatomy(segments: Segment[]): AnatomyToken[] {
  return segments.map((s, i) => ({
    n: i + 1,
    text: s.text,
    label: s.label,
    note: s.note,
    color: ACCENT[s.accent] ?? FALLBACK,
  }))
}
