// lib/authoring/research.ts
// S2 of the course-authoring engine: emit a per-lesson research PROMPT the author runs
// in their own agent (mirrors learn-prompt.ts / sovereign BYO ethos — no live LLM call),
// and (Task 2) parse the returned notes for the S3 draft stage. Pure, no I/O.
import type { Locale } from '@/lib/dictionaries'
import { lintDehustle } from './dehustle'

export interface ResearchNotes {
  concepts: string[]     // key concepts to teach (CONCEPT phase)
  hook: string           // bisociative/analogy seed for ACTIVATION (mental, not "write")
  misconception: string  // a common wrong mental model to pre-empt
  practice: string       // a concrete applied-step seed for PRACTICE
  sources: string[]      // 2–3 credible things to verify against
}

export interface ResearchInput {
  courseName: string
  moduleTitle: string
  unitTitle: string
  objective: string
  locale: Locale
}

/** A de-hustled, bilingual, pedagogy-encoded research prompt for the author's own agent. */
export function buildResearchPrompt(i: ResearchInput): string {
  if (i.locale === 'en') {
    return [
      `You are helping me research one lesson of my course "${i.courseName}" — honest, calm, no selling.`,
      `Module: "${i.moduleTitle}". Lesson: "${i.unitTitle}". Objective: ${i.objective}`,
      ``,
      `Research the lesson toward that objective. I teach in a four-phase rhythm (activation → reflection → concept → practice); the activation hook is a BISOCIATIVE, purely mental image — never ask the learner to write or type.`,
      ``,
      `Reply in EXACTLY this labeled format, nothing else:`,
      `CONCEPTS:`,
      `- <key concept, short sentence>`,
      `- <key concept, short sentence>`,
      `HOOK: <one mental bisociative image that opens the lesson — no "write"/"type">`,
      `MISCONCEPTION: <one common wrong mental model to pre-empt>`,
      `PRACTICE: <one concrete applied step the learner does for real>`,
      `SOURCES:`,
      `- <credible source to verify against>`,
      `- <credible source to verify against>`,
    ].join('\n')
  }
  return [
    `Помоги мне исследовать один урок моего курса «${i.courseName}» — честно, спокойно, без продаж.`,
    `Модуль: «${i.moduleTitle}». Урок: «${i.unitTitle}». Цель: ${i.objective}`,
    ``,
    `Исследуй урок под эту цель. Я преподаю в четырёхфазном ритме (активация → рефлексия → концепт → практика); хук активации — БИСОЦИАТИВНЫЙ, чисто мысленный образ — никогда не проси ученика писать или печатать.`,
    ``,
    `Ответь СТРОГО в этом размеченном формате, без лишнего:`,
    `CONCEPTS:`,
    `- <ключевой концепт, короткое предложение>`,
    `- <ключевой концепт, короткое предложение>`,
    `HOOK: <один мысленный бисоциативный образ, открывающий урок — без «напиши»/«печатай»>`,
    `MISCONCEPTION: <одна частая ошибочная ментальная модель, которую надо предупредить>`,
    `PRACTICE: <один конкретный прикладной шаг, который ученик делает по-настоящему>`,
    `SOURCES:`,
    `- <надёжный источник для проверки>`,
    `- <надёжный источник для проверки>`,
  ].join('\n')
}

/** Pure parser: a labeled agent reply -> ResearchNotes + a list of problems
 *  (missing/empty required sections, and any de-hustle hits in the parsed content). */
export function parseResearchNotes(text: string): { notes: ResearchNotes; errors: string[] } {
  const notes: ResearchNotes = { concepts: [], hook: '', misconception: '', practice: '', sources: [] }
  const errors: string[] = []

  let section: 'concepts' | 'sources' | null = null
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (/^CONCEPTS:/i.test(line)) { section = 'concepts'; continue }
    if (/^SOURCES:/i.test(line)) { section = 'sources'; continue }
    const hook = /^HOOK:\s*(.*)$/i.exec(line)
    if (hook) { notes.hook = hook[1].trim(); section = null; continue }
    const mis = /^MISCONCEPTION:\s*(.*)$/i.exec(line)
    if (mis) { notes.misconception = mis[1].trim(); section = null; continue }
    const prac = /^PRACTICE:\s*(.*)$/i.exec(line)
    if (prac) { notes.practice = prac[1].trim(); section = null; continue }
    if (section && /^-\s+/.test(line)) {
      const item = line.replace(/^-\s+/, '').trim()
      if (item) notes[section].push(item)
    }
  }

  if (notes.concepts.length === 0) errors.push('CONCEPTS: at least one concept required')
  if (!notes.hook) errors.push('HOOK: missing or empty')
  if (!notes.misconception) errors.push('MISCONCEPTION: missing or empty')
  if (!notes.practice) errors.push('PRACTICE: missing or empty')
  if (notes.sources.length === 0) errors.push('SOURCES: at least one source required')

  const all = [...notes.concepts, notes.hook, notes.misconception, notes.practice, ...notes.sources].join(' ')
  for (const term of lintDehustle(all)) errors.push(`de-hustle: banned term "${term}"`)

  return { notes, errors }
}
