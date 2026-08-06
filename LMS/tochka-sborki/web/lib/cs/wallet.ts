// web/lib/cs/wallet.ts
import type { Mode, Wallet } from './types'
import { STORAGE_KEY, DEFAULT_WALLET } from './types'
import { computeUnitCS } from './award'

export function applyAward(wallet: Wallet, unitKey: string, mode: Mode): Wallet {
  if (wallet.earnedUnits.includes(unitKey)) return wallet
  return {
    ...wallet,
    balance: wallet.balance + computeUnitCS(mode),
    earnedUnits: [...wallet.earnedUnits, unitKey],
    modeByUnit: { ...wallet.modeByUnit, [unitKey]: mode },
  }
}

// Flat idempotent credit (e.g. daily-quest rewards). Reuses earnedUnits as the idempotency ledger
// via namespaced synthetic keys like "daily:2026-05-24:p0" — no mode, unlike applyAward.
export function applyCredit(wallet: Wallet, key: string, amount: number): Wallet {
  if (wallet.earnedUnits.includes(key)) return wallet
  return {
    ...wallet,
    balance: wallet.balance + amount,
    earnedUnits: [...wallet.earnedUnits, key],
  }
}

export function applySpend(
  wallet: Wallet,
  cost: number,
  unlockId: string,
): { wallet: Wallet; ok: boolean } {
  if (wallet.unlocks.includes(unlockId)) return { wallet, ok: false }
  if (wallet.balance < cost) return { wallet, ok: false }
  return {
    wallet: { ...wallet, balance: wallet.balance - cost, unlocks: [...wallet.unlocks, unlockId] },
    ok: true,
  }
}

export function setModeFor(wallet: Wallet, unitKey: string, mode: Mode): Wallet {
  return { ...wallet, modeByUnit: { ...wallet.modeByUnit, [unitKey]: mode } }
}

export function readWallet(): Wallet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_WALLET
    const parsed = JSON.parse(raw) as Partial<Wallet>
    return {
      balance: parsed.balance ?? 0,
      earnedUnits: parsed.earnedUnits ?? [],
      unlocks: parsed.unlocks ?? [],
      modeByUnit: parsed.modeByUnit ?? {},
    }
  } catch {
    return DEFAULT_WALLET
  }
}

export function writeWallet(wallet: Wallet): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet))
  } catch {}
}
