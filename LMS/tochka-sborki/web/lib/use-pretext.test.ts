import { describe, it, expect } from 'vitest'
import { fontSizeOf, lineHeightPx } from './use-pretext'

describe('fontSizeOf', () => {
  it('читает кегль из обычной canvas-спеки', () => {
    expect(fontSizeOf("14px 'Geist Mono', monospace")).toBe(14)
    expect(fontSizeOf('16px sans-serif')).toBe(16)
  })

  it('понимает дробный кегль', () => {
    expect(fontSizeOf("13.5px 'Geist Mono'")).toBe(13.5)
  })

  it('читает кегль и когда перед ним стоят начертание и насыщенность', () => {
    expect(fontSizeOf("italic bold 18px 'Geist'")).toBe(18)
  })

  it('без единиц px откатывается к запасному кеглю', () => {
    // rem/em в canvas-спеке не работают — это не «ноль», а «меряем дефолтом»
    expect(fontSizeOf('1.5rem sans-serif')).toBe(16)
    expect(fontSizeOf('')).toBe(16)
    expect(fontSizeOf('monospace')).toBe(16)
  })

  it('нулевой и отрицательный кегль не принимаются', () => {
    // 0px схлопнул бы высоту строки в ноль, и подпись исчезла бы без ошибки
    expect(fontSizeOf('0px sans-serif')).toBe(16)
    expect(fontSizeOf('-4px sans-serif')).toBe(16)
  })

  it('запасной кегль можно задать явно', () => {
    expect(fontSizeOf('monospace', 12)).toBe(12)
  })
})

describe('lineHeightPx', () => {
  it('умножает кегль на множитель', () => {
    expect(lineHeightPx("14px 'Geist Mono'", 1.5)).toBe(21)
  })

  it('множитель 1 даёт сам кегль', () => {
    expect(lineHeightPx('20px sans-serif', 1)).toBe(20)
  })

  it('на нечитаемой спеке считает от запасного кегля, а не от нуля', () => {
    expect(lineHeightPx('monospace', 1.5)).toBe(24)
  })
})
