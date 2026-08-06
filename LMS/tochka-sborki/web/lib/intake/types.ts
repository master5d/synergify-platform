// web/lib/intake/types.ts
export type Locale = 'ru' | 'en'
export type QuestionFormat = 'number' | 'single' | 'multi' | 'likert' | 'text'
export type AttributeCode = 'INT' | 'WIS' | 'CON' | 'DEX' | 'CHA' | 'STR'
export type ModuleId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'V' | 'VD'

export type InstrumentVersion = 1 | 2

export type MbtiAxis = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P'
export type MbtiType = string // 4-letter, e.g. 'INTJ'

export interface RelationalStyle {
  rhythm: 'suave' | 'fuego' | 'libre' | 'ritual' | null
  errorStyle: 'calm' | 'lose_motivation' | 'soft_feedback' | 'fix_immediately' | null
  anchor: 'support' | 'topics' | 'quick_wins' | 'structure' | 'freedom' | null
  attention: 'short' | 'mid' | 'long' | null
}

export type CharacterClass =
  | 'artificer' | 'mage' | 'operator' | 'healer' | 'sovereign' | 'wanderer'

export type WorldSkin =
  | 'slavic-myth' | 'dark-fantasy' | 'cyber-noir' | 'space-opera'
  | 'anime-quest' | 'soviet-heroic' | 'mystic-arcane' | 'wanderer'

export interface QuestionOption {
  value: string
  label: { ru: string; en: string }
}

export interface Question {
  id: string
  module: ModuleId
  format: QuestionFormat
  required: boolean
  prompt: { ru: string; en: string }
  options?: QuestionOption[]
  placeholder?: { ru: string; en: string }
  showIf?: { questionId: string; equals: string }
}

export interface ModuleIntro {
  id: ModuleId
  title: { ru: string; en: string }
  intro: { ru: string; en: string }
}

export type AnswerValue = string | number | string[]
export type Answers = Record<string, AnswerValue>

export interface ScoreResult {
  int: number; wis: number; con: number; dex: number; cha: number; str: number
  charClass: CharacterClass
  charLevel: number
  worldSkin: WorldSkin
  worldSkinSource: 'g9' | 'g3' | 'wanderer-fallback' | 'v2'
  cogTier: number
  register: string
  sheetLanguage: string
  niche: string | null
  os: string | null
  strLowConfidence: boolean
  mbti: MbtiType | null
  relationalStyle: RelationalStyle | null
}
