import { describe, it, expect } from 'vitest'
import { buildAnatomy, ACCENT, FALLBACK, type Segment } from './annotated-example'

const seg = (text: string, accent: Segment['accent']): Segment => ({ text, label: `${text}-label`, note: `${text}-note`, accent })

describe('buildAnatomy', () => {
  it('numbers tokens 1..n sequentially', () => {
    const out = buildAnatomy([seg('a', 'lime'), seg('b', 'cyan'), seg('c', 'amber')])
    expect(out.map(t => t.n)).toEqual([1, 2, 3])
  })
  it('resolves a known accent to its exact ACCENT triple', () => {
    const [t] = buildAnatomy([seg('x', 'cyan')])
    expect(t.color).toEqual(ACCENT.cyan)
  })
  it('resolves an unknown accent to FALLBACK (never undefined)', () => {
    const [t] = buildAnatomy([{ text: 'x', label: 'l', note: 'n', accent: 'zzz' as Segment['accent'] }])
    expect(t.color).toEqual(FALLBACK)
    expect(t.color).toBeDefined()
  })
  it('returns [] for empty input', () => {
    expect(buildAnatomy([])).toEqual([])
  })
  it('preserves text, label and note verbatim', () => {
    const [t] = buildAnatomy([{ text: 'роль', label: 'кто', note: 'почему', accent: 'violet' }])
    expect(t.text).toBe('роль')
    expect(t.label).toBe('кто')
    expect(t.note).toBe('почему')
  })
  it('exposes 6 accents in the ACCENT map', () => {
    expect(Object.keys(ACCENT).sort()).toEqual(['amber', 'cyan', 'lime', 'magenta', 'rose', 'violet'])
  })
})
