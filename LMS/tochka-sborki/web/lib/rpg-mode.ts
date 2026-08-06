// web/lib/rpg-mode.ts
// Global RPG ↔ plain-language preference. Mirrors the os-pref.ts pattern (binary, localStorage).
// 'rpg' (default) keeps the game-flavored chrome; 'plain' swaps a curated set of static chrome
// labels to plain wording for non-gamers. Skin-generated flavor (dungeon/daily/map) is NOT touched.
import type { Locale } from '@/lib/intake/types'

export type RpgMode = 'rpg' | 'plain'
export const RPG_MODE_KEY = 'rpg-mode'

export type OverrideKey = 'navQuestLog' | 'enterQuestLog' | 'sheetName' | 'currency'

export const PLAIN_OVERRIDES: Record<Locale, Record<OverrideKey, string>> = {
  ru: {
    navQuestLog: 'Мои уроки',
    enterQuestLog: 'Открыть мои уроки →',
    sheetName: 'профиль ученика',
    currency: 'очки',
  },
  en: {
    navQuestLog: 'My lessons',
    enterQuestLog: 'Open my lessons →',
    sheetName: 'student profile',
    currency: 'points',
  },
}

// Shown on the character sheet in BOTH modes — clears the "modules depend on skills" misread.
export const SKILL_GATING_NOTE: Record<Locale, string> = {
  ru: 'Это игровой штрих. «Характеристики» ничего не блокируют — модули проходятся в любом порядке, и программировать не нужно.',
  en: 'This is a playful touch. These "stats" don\'t lock anything — take modules in any order, no programming required.',
}

/** Plain override when mode is 'plain', otherwise the caller's RPG fallback. */
export function plainLabel(mode: RpgMode, locale: Locale, key: OverrideKey, fallback: string): string {
  return mode === 'plain' ? PLAIN_OVERRIDES[locale][key] : fallback
}

export function readStoredRpgMode(): RpgMode | null {
  try {
    const raw = localStorage.getItem(RPG_MODE_KEY)
    return raw === 'rpg' || raw === 'plain' ? raw : null
  } catch {
    return null
  }
}

export function storeRpgMode(mode: RpgMode): void {
  try {
    localStorage.setItem(RPG_MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}

/** The mode the page should use right now (default 'rpg'). */
export function effectiveRpgMode(): RpgMode {
  return readStoredRpgMode() ?? 'rpg'
}
