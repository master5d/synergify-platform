// lib/breaks/types.ts
// Trigger-engine types for the break interstitial (fb_a03db93a5bbe + fb_282cf1c678f7).
// `Bi` is module-local by convention (see lib/course/office-hours.ts); only Locale is imported.
interface Bi { ru: string; en: string }

export interface PassiveBreak {
  kind: 'passive'
  key: string
  title: Bi
  prompt: Bi
  cta?: Bi
}

export interface PuzzleBreak {
  kind: 'puzzle'
  key: string
  title: Bi
  question: Bi
  choices: Bi[]   // >= 2
  answer: number  // index into choices
  reveal: Bi      // one-line explanation shown after answering
  cta?: Bi
}

export type BreakActivity = PassiveBreak | PuzzleBreak

export interface ResolvedPassive {
  kind: 'passive'
  key: string
  title: string
  prompt: string
  cta: string
}

export interface ResolvedPuzzle {
  kind: 'puzzle'
  key: string
  title: string
  question: string
  choices: string[]
  answer: number
  reveal: string
  cta: string
}

export type ResolvedBreak = ResolvedPassive | ResolvedPuzzle

export interface BreakContext {
  availableCount: number
  currentStep: number
  stepsSinceLastBreak: number
  breaksShownThisSession: number
  restMode: boolean
}
