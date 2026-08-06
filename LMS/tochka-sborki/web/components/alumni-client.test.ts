import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'alumni-client.tsx'), 'utf8')

describe('synergems — academy-wide framing (S5)', () => {
  it('no course-scoped synergem copy remains', () => {
    expect(src).not.toMatch(/course synergems|синергемах курса/)
  })

  it('academy framing present in both locales', () => {
    expect(src).toContain('academy synergems')
    expect(src).toContain('синергемах академии')
  })

  it('teach-to-learn principle present in both locales', () => {
    expect(src).toContain('Every learner here is also a teacher')
    expect(src).toContain('Каждый ученик здесь — ещё и учитель')
  })

  it('privacy line survives (email never shown)', () => {
    expect(src).toContain('Your email is never shown')
    expect(src).toContain('Твой email никогда не показывается')
  })
})
