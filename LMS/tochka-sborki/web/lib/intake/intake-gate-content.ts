import type { Locale } from '@/lib/intake/types'
import { INTAKE_GATE } from '@/lib/course/intake-gate'

// Plain-language clarity-gate shown as step 0 of the intake wizard, BEFORE any RPG question.
// Answers "what is this / what you'll get / it's a metaphor, not a game" at the drop-off point.
// The copy is course-data in the pack (packs/<pack>/course/intake-gate.ts, intake LMS#16);
// this builder and the <IntakeGate> component are the engine. Mirrors onboarding-bridge-content.

export interface IntakeGateRow { before: string; after: string }
export interface IntakeGateContent {
  eyebrow: string
  title: string
  lead: string
  beforeLabel: string
  afterLabel: string
  rows: IntakeGateRow[]
  keep: string
  frame: string
  enterLabel: string
  moreLabel: string
  moreHref: string
}

export function buildIntakeGateContent(locale: Locale): IntakeGateContent {
  const T = INTAKE_GATE
  return {
    eyebrow: T.eyebrow[locale],
    title: T.title[locale],
    lead: T.lead[locale],
    beforeLabel: T.beforeLabel[locale],
    afterLabel: T.afterLabel[locale],
    rows: T.rows.map((r) => ({ before: r.before[locale], after: r.after[locale] })),
    keep: T.keep[locale],
    frame: T.frame[locale],
    enterLabel: T.enter[locale],
    moreLabel: T.more[locale],
    moreHref: locale === 'en' ? '/en' : '/',
  }
}
