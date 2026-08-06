// lib/authoring/draft.ts
// S3 of the course-authoring engine: deterministically weave a unit's ResearchNotes (S2)
// into a valid 4-Phase MDX lesson draft (S4 polishes the prose later). Pure, no LLM/I/O.
import type { Locale } from '@/lib/dictionaries'
import type { ResearchNotes } from './research'
import { lintDehustle } from './dehustle'

export interface DraftInput {
  unitTitle: string
  unitIndex: number   // 0-based
  moduleIndex: number // 0-based
  objective: string
  notes: ResearchNotes
  locale: Locale
}

// A clean, de-hustle-safe English fixture aligned to 01-sample/u1-intro. No write/type verbs.
export const SAMPLE_NOTES: ResearchNotes = {
  concepts: [
    'A course module is a small arc: one idea, built up and then applied',
    'You learn by doing a real step, not by collecting theory',
  ],
  hook: 'a hall of mirrors where each reflection already knows one slice of your work',
  misconception: 'that you must understand everything before you can start',
  practice: 'name one real task you want this module to help you finish',
  sources: ['the course README', 'your own weekly workflow'],
}

export function draftLesson(i: DraftInput): string {
  const { notes } = i
  const concepts = notes.concepts.map(c => `- ${c}`).join('\n')
  const frontmatter = [
    `---`,
    `title: "${i.unitTitle}"`,
    `unit: ${i.unitIndex + 1}`,
    `module: ${i.moduleIndex + 1}`,
    `duration: "TODO"`,
    `---`,
    ``,
    `{/* objective: ${i.objective} */}`,
    ``,
  ].join('\n')
  const sources = `\n{/* sources: ${notes.sources.join('; ')} */}\n`

  if (i.locale === 'en') {
    return frontmatter + [
      `<Phase type="activation">`,
      ``,
      `Picture this: ${notes.hook}.`,
      ``,
      `Run it in your head — where have you met this before?`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="reflection">`,
      ``,
      `Many assume: ${notes.misconception}.`,
      ``,
      `Check it in your head: is that true for you?`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="concept">`,
      ``,
      concepts,
      ``,
      `> ⚠️ Common misconception: ${notes.misconception}`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="practice">`,
      ``,
      `Do this: ${notes.practice}`,
      ``,
      `</Phase>`,
    ].join('\n') + sources
  }

  return frontmatter + [
    `<Phase type="activation">`,
    ``,
    `Представь: ${notes.hook}.`,
    ``,
    `Прокрути это в голове — где это уже встречалось тебе?`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="reflection">`,
    ``,
    `Многие думают: ${notes.misconception}.`,
    ``,
    `Мысленно проверь: так ли это в твоём случае?`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="concept">`,
    ``,
    concepts,
    ``,
    `> ⚠️ Частое заблуждение: ${notes.misconception}`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="practice">`,
    ``,
    `Сделай: ${notes.practice}`,
    ``,
    `</Phase>`,
  ].join('\n') + sources
}

/** Reusable MDX conformance check (also validates S4's polished output later).
 *  [] = conforms. */
export function validateDraftMdx(mdx: string): string[] {
  const errors: string[] = []
  if (!/^---\ntitle: "/.test(mdx)) errors.push('frontmatter: missing title')

  const phases = [...mdx.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
  const expected = ['activation', 'reflection', 'concept', 'practice']
  if (phases.join(',') !== expected.join(',')) {
    errors.push(`phases must be ${expected.join(' -> ')} (got ${phases.join(' -> ') || 'none'})`)
  }

  const block = (type: string) =>
    new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`).exec(mdx)?.[1] ?? ''
  for (const type of ['activation', 'reflection']) {
    if (/\b(напиши|запиши|type|write)\b/i.test(block(type))) {
      errors.push(`${type}: contains a write/type imperative (must be mental)`)
    }
  }

  for (const term of lintDehustle(mdx)) errors.push(`de-hustle: banned term "${term}"`)
  return errors
}
