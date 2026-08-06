import { describe, it, expect } from 'vitest'
import { applyAward, applySpend, setModeFor, applyCredit } from './wallet'
import { DEFAULT_WALLET } from './types'

describe('applyAward', () => {
  it('adds the unit CS once and records the unit + mode', () => {
    const w = applyAward(DEFAULT_WALLET, '04-prompt-engineering/u1', 'copilot')
    expect(w.balance).toBe(105)
    expect(w.earnedUnits).toContain('04-prompt-engineering/u1')
    expect(w.modeByUnit['04-prompt-engineering/u1']).toBe('copilot')
  })

  it('is idempotent for a repeated unit key', () => {
    const once = applyAward(DEFAULT_WALLET, 'm/u', 'archmage')
    const twice = applyAward(once, 'm/u', 'commander')
    expect(twice.balance).toBe(175)
    expect(twice.earnedUnits.filter(k => k === 'm/u')).toHaveLength(1)
    expect(twice.modeByUnit['m/u']).toBe('archmage')
  })

  it('does not mutate the input wallet', () => {
    applyAward(DEFAULT_WALLET, 'm/u', 'commander')
    expect(DEFAULT_WALLET.balance).toBe(0)
    expect(DEFAULT_WALLET.earnedUnits).toHaveLength(0)
  })
})

describe('applySpend', () => {
  const funded = { ...DEFAULT_WALLET, balance: 400 }

  it('decrements balance and records the unlock when affordable', () => {
    const { wallet, ok } = applySpend(funded, 300, 'dark-fantasy')
    expect(ok).toBe(true)
    expect(wallet.balance).toBe(100)
    expect(wallet.unlocks).toContain('dark-fantasy')
  })

  it('refuses when balance < cost', () => {
    const { wallet, ok } = applySpend({ ...DEFAULT_WALLET, balance: 50 }, 300, 'dark-fantasy')
    expect(ok).toBe(false)
    expect(wallet.balance).toBe(50)
    expect(wallet.unlocks).not.toContain('dark-fantasy')
  })

  it('refuses a duplicate unlock without charging again', () => {
    const first = applySpend(funded, 300, 'cyber-noir').wallet
    const { wallet, ok } = applySpend(first, 300, 'cyber-noir')
    expect(ok).toBe(false)
    expect(wallet.balance).toBe(100)
  })
})

describe('setModeFor', () => {
  it('records the chosen mode for a unit without touching balance', () => {
    const w = setModeFor(DEFAULT_WALLET, 'm/u', 'archmage')
    expect(w.modeByUnit['m/u']).toBe('archmage')
    expect(w.balance).toBe(0)
  })
})

describe('applyCredit', () => {
  it('adds a flat amount once for a given key', () => {
    const w = applyCredit(DEFAULT_WALLET, 'daily:2026-05-24:p0', 10)
    expect(w.balance).toBe(10)
    expect(w.earnedUnits).toContain('daily:2026-05-24:p0')
  })

  it('is idempotent for a repeated key', () => {
    const once = applyCredit(DEFAULT_WALLET, 'daily:2026-05-24:bonus', 15)
    const twice = applyCredit(once, 'daily:2026-05-24:bonus', 15)
    expect(twice.balance).toBe(15)
    expect(twice.earnedUnits.filter(k => k === 'daily:2026-05-24:bonus')).toHaveLength(1)
  })

  it('does not mutate the input wallet', () => {
    applyCredit(DEFAULT_WALLET, 'k', 5)
    expect(DEFAULT_WALLET.balance).toBe(0)
  })
})
