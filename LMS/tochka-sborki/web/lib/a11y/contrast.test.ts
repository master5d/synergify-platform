import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('is ~21 for black on white', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeGreaterThan(20.9)
  })
  it('is 1 for identical colors', () => {
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })
  it('is order-independent', () => {
    expect(contrastRatio('#0070c0', '#f4f1ea')).toBeCloseTo(
      contrastRatio('#f4f1ea', '#0070c0'), 5,
    )
  })
})

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const MODEL_KIT = join(HERE, '..', '..', 'themes', 'model-kit.css') // web/themes/model-kit.css

// Extract a `--name: #rrggbb` map from a single [data-theme="<name>"] { … } block.
function themeTokens(css: string, theme: 'dark' | 'light'): Record<string, string> {
  const block = new RegExp(`\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`).exec(css)
  if (!block) throw new Error(`theme block not found: ${theme}`)
  const out: Record<string, string> = {}
  const re = /--([\w-]+):\s*(#[0-9a-fA-F]{6})/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block[1])) !== null) out[m[1]] = m[2]
  return out
}

// Pairs that must meet AA normal-text (>= 4.5): [fg token, bg token].
const PAIRS: [string, string][] = [
  ['text-primary', 'bg-primary'],
  ['text-secondary', 'bg-primary'],
  ['text-secondary', 'bg-surface'],
  ['text-accent', 'bg-primary'],
  ['text-on-accent', 'text-accent'],
  ['crit', 'bg-primary'],
]

describe('model-kit WCAG AA contrast guard', () => {
  const css = readFileSync(MODEL_KIT, 'utf8')
  for (const theme of ['dark', 'light'] as const) {
    const t = themeTokens(css, theme)
    for (const [fg, bg] of PAIRS) {
      it(`${theme}: --${fg} on --${bg} meets AA (>=4.5)`, () => {
        const r = contrastRatio(t[fg], t[bg])
        expect(r, `${theme} --${fg} (${t[fg]}) on --${bg} (${t[bg]}) = ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
