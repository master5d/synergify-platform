import { describe, it, expect } from 'vitest'
import { clampSize, shuffle, generateGrid, MIN_SIZE, MAX_SIZE, DEFAULT_SIZE } from './schulte'

describe('clampSize', () => {
  it('bounds, rounds, and defaults on NaN', () => {
    expect(clampSize(1)).toBe(MIN_SIZE)
    expect(clampSize(99)).toBe(MAX_SIZE)
    expect(clampSize(5.4)).toBe(5)
    expect(clampSize(Number.NaN)).toBe(DEFAULT_SIZE)
  })
})

describe('shuffle', () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  it('is deterministic for a fixed seed', () => {
    expect(shuffle(base, 42)).toEqual(shuffle(base, 42))
  })
  it('is a permutation of the input (same multiset)', () => {
    expect([...shuffle(base, 7)].sort((a, b) => a - b)).toEqual(base)
  })
  it('different seeds usually differ', () => {
    expect(shuffle(base, 1)).not.toEqual(shuffle(base, 2))
  })
  it('does not mutate the input array', () => {
    const input = [...base]
    shuffle(input, 99)
    expect(input).toEqual(base)
  })
})

describe('generateGrid', () => {
  it('has length size² and contains each of 1..size² exactly once', () => {
    const grid = generateGrid(123, 5)
    expect(grid).toHaveLength(25)
    expect([...grid].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
  })
  it('is deterministic for a fixed seed', () => {
    expect(generateGrid(123, 5)).toEqual(generateGrid(123, 5))
  })
  it('respects clampSize (size 99 → 7×7 = 49 cells)', () => {
    expect(generateGrid(1, 99)).toHaveLength(49)
  })
})
